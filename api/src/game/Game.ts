import GameConnectionIdRequest from "../shared/game/GameConnectionIdRequest";
import GameContext from "./context/GameContext";
import GameEnterRequest from "../shared/game/GameEnterRequest";
import GameMember from "../shared/actor/GameMember";
import GameObserver from "./user/models/GameObserver";
import GameRequest from "../shared/game/GameRequest";
import GameStage from "./GameStage";
import GameUser from "./user/models/GameUser";
import NetworkSystem from "./system/NetworkSystem";
import Ticker from "./tick/Ticker";
import constants from "./constants";
import dropConnection from "./response/drop";
import getPlayerColor from "./support/getPlayerColor";
import isEndOfGame from "./context/isEndOfGame";
import logger from "./logger";
import newGameContext from "./context/newGameContext";
import processChange from "./processChange";
import sleep from "./tick/sleep";

export default class Game {
  private readonly users: GameUser[];
  private readonly observers: GameObserver[];
  private readonly connectedUsers: { [connectionId: string]: GameUser } = {};
  private readonly context: GameContext;

  private readonly networkSystem: NetworkSystem;
  private lastMillis: number;
  private ticker: Ticker | null;

  constructor(
    private readonly gameId: string,
    members: GameMember[],
    private readonly pollRequests: () => Promise<GameRequest[]>
  ) {
    this.context = newGameContext();

    // Setup game context from members.
    this.users = members
      .filter((member) => !member.observer)
      .map(
        (member, index): GameUser => ({
          // userIndex should start from 1.
          index: index + 1,
          color: getPlayerColor(index),
          connectionId: "",
          load: false,
          memberId: member.memberId,
        })
      );
    this.observers = members
      .filter((member) => member.observer)
      .map(
        (member): GameObserver => ({
          memberId: member.memberId,
          connectionId: "",
        })
      );

    // Initialize other systems.
    this.networkSystem = new NetworkSystem(
      this.users,
      this.observers,
      this.context
    );
  }

  public async run(): Promise<void> {
    try {
      await this.stageWait();
      if (Object.keys(this.connectedUsers).length > 0) {
        await this.stageRunning();
      }
    } catch (error) {
      logger.error(`Error in game logic`, error);
    }
    await this.stageEnd();
  }

  private async stageWait() {
    logger.info(`Game WAIT-stage`, this.gameId, this.users);

    this.ticker = new Ticker(GameStage.Wait, constants.gameWaitSeconds * 1000);
    while (this.ticker.isAlive()) {
      const requests = await this.pollRequests();
      await this.processEnterLeaveLoad(requests);

      if (Object.keys(this.connectedUsers).length === this.users.length) {
        break;
      }

      await this.ticker.checkAgeChanged(this.broadcastStage);
      await sleep(constants.loopInterval);
    }
  }

  private async stageRunning() {
    logger.info(`Game RUNNING-stage`, this.gameId, this.users);

    this.lastMillis = Date.now();
    this.ticker = new Ticker(
      GameStage.Running,
      constants.gameRunningSeconds * 1000
    );
    while (this.ticker.isAlive()) {
      const requests = await this.pollRequests();
      await this.processEnterLeaveLoad(requests);

      await this.processChanges(requests);
      await this.update();

      await this.ticker.checkAgeChanged(this.broadcastStage);
      await sleep(constants.loopInterval);

      if (isEndOfGame(this.context)) {
        break;
      }
    }
  }

  private async stageEnd() {
    logger.info(`Game END-stage`, this.gameId);
    await this.networkSystem.end();
    await Promise.all(Object.keys(this.connectedUsers).map(dropConnection));
  }

  private async processEnterLeaveLoad(requests: GameRequest[]) {
    // TODO Error tolerance
    for (const request of requests) {
      try {
        switch (request.type) {
          case "enter":
            await this.onEnter(request);
            break;
          case "leave":
            this.onLeave(request);
            break;
          case "load":
            await this.onLoad(request);
            break;
        }
      } catch (error) {
        logger.error(`Error in request`, request, error);
      }
    }
  }

  private async processChanges(requests: GameRequest[]) {
    const promises: Array<Promise<void>> = [];
    for (const request of requests) {
      if (!this.isValidUser(request)) {
        continue;
      }
      const user = this.connectedUsers[request.connectionId];
      try {
        const maybe = processChange({
          request,
          user,
          context: this.context,
          network: this.networkSystem,
        });
        if (maybe !== undefined) {
          promises.push(maybe);
        }
      } catch (error) {
        logger.error(`Error in processing change`, request, error);
      }
    }
    if (promises.length === 0) {
      return;
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      logger.error(`Error in awaiting updates`, error);
    }
  }

  private async update() {
    const now = Date.now();
    const dt = (now - this.lastMillis) / 1000;
    this.lastMillis = now;

    return await this.updateWithDt(dt);
  }

  private async updateWithDt(dt: number) {
    // TODO
    console.log(dt);
  }

  private isValidUser({ connectionId }: GameConnectionIdRequest) {
    return this.connectedUsers[connectionId] !== undefined;
  }

  private async onEnter({ connectionId, memberId }: GameEnterRequest) {
    const newbie = this.users.find((u) => u.memberId === memberId);
    const observer = this.observers.find((o) => o.memberId === memberId);
    if (observer) {
      observer.connectionId = connectionId;
    } else if (newbie) {
      newbie.connectionId = connectionId;
      newbie.load = false;

      this.connectedUsers[connectionId] = newbie;
      logger.debug(
        { gameId: this.gameId, newbie, users: this.users },
        `Game newbie`
      );
      await this.networkSystem.newbie(newbie);
    }
  }

  private onLeave({ connectionId }: GameConnectionIdRequest) {
    const leaver = this.connectedUsers[connectionId];
    const observer = this.observers.find(
      (o) => o.connectionId === connectionId
    );

    if (observer) {
      observer.connectionId = "";
    } else if (leaver) {
      leaver.connectionId = "";
      leaver.load = false;
      delete this.connectedUsers[connectionId];

      // No reset for leaver because they can reconnect.
    }
  }

  private async onLoad({ connectionId }: GameConnectionIdRequest) {
    const user = this.connectedUsers[connectionId];
    const observer = this.observers.find(
      (o) => o.connectionId === connectionId
    );
    if (observer) {
      logger.debug({ gameId: this.gameId, observer }, `Game load observer`);
      await this.networkSystem.loadObserver(
        observer,
        this.ticker!.stage,
        this.ticker!.age
      );
    } else if (user) {
      user.load = true;
      // TODO
      logger.debug(
        { gameId: this.gameId, connectionId, users: this.users },
        `Game load`
      );
      await this.networkSystem.load(user, this.ticker!.stage, this.ticker!.age);
    }
  }

  private async broadcastStage(stage: GameStage, age: number) {
    logger.debug(
      { gameId: this.gameId, users: this.users, stage, age },
      `Game broadcast stage`
    );
    await this.networkSystem.stage(stage, age);
  }
}
