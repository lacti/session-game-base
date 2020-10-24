import GameClientRequest from "../shared/game/GameClientRequest";
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
import filterClientRequest from "./filterClientRequest";
import { getLogger } from "@yingyeothon/slack-logger";
import getPlayerColor from "./support/getPlayerColor";
import isEndOfGame from "./context/isEndOfGame";
import newGameContext from "./context/newGameContext";
import newRandomCard from "./context/newRandomCard";
import processChange from "./processChange";
import sleep from "./tick/sleep";

const logger = getLogger("game", __filename);

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
          hp: 100,
          cards: newRandomCard(),
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

    this.context = newGameContext(this.users);

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
      logger.error({ error }, `Error in game logic`);
    }
    await this.stageEnd();
  }

  private async stageWait() {
    logger.info({ gameId: this.gameId, users: this.users }, `Game WAIT-stage`);

    this.ticker = new Ticker(GameStage.Wait, constants.gameWaitSeconds * 1000);
    while (this.ticker.isAlive()) {
      const requests = await this.pollRequests();
      await this.processMessages(requests, "enter", this.onEnter.bind(this));
      await this.processMessages(requests, "leave", this.onLeave.bind(this));
      await this.ticker.checkAgeChanged(this.broadcastStage.bind(this));
      if (this.isFullyConnected()) {
        break;
      }
      await sleep(constants.loopInterval);
    }

    await sleep(1000);
    await this.broadcastLoad();
  }

  private async broadcastLoad(): Promise<void> {
    try {
      await Promise.all(
        this.users.map((u) => this.onLoad({ connectionId: u.connectionId }))
      );
    } catch (error) {
      logger.error(
        { gameId: this.gameId, users: this.users, error },
        "Cannot broadcast game context"
      );
    }
  }

  private isFullyConnected(): boolean {
    return Object.keys(this.connectedUsers).length === this.users.length;
  }

  private async stageRunning() {
    logger.info(
      { gameId: this.gameId, users: this.users },
      `Game RUNNING-stage`
    );

    this.lastMillis = Date.now();
    this.ticker = new Ticker(
      GameStage.Running,
      constants.gameRunningSeconds * 1000
    );
    while (this.ticker.isAlive()) {
      const requests = await this.pollRequests();
      await this.processMessages(requests, "leave", this.onLeave.bind(this));
      await this.processChanges(filterClientRequest(requests));
      await this.update();

      await this.ticker.checkAgeChanged(this.broadcastStage.bind(this));
      await sleep(constants.loopInterval);

      if (isEndOfGame(this.context, this.ticker) || !this.isFullyConnected()) {
        break;
      }
    }
  }

  private async stageEnd() {
    logger.info({ gameId: this.gameId, users: this.users }, `Game END-stage`);
    await this.networkSystem.end();
    await Promise.all(Object.keys(this.connectedUsers).map(dropConnection));
  }

  private async processMessages(
    requests: GameRequest[],
    type: GameRequest["type"],
    handler: (request: GameRequest) => Promise<unknown>
  ): Promise<void> {
    for (const request of requests) {
      if (request.type !== type) {
        continue;
      }
      try {
        await handler(request);
      } catch (error) {
        logger.error({ request, error }, `Error in request`);
      }
    }
  }

  private async processChanges(requests: GameClientRequest[]) {
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
        logger.error({ request, error }, `Error in processing change`);
      }
    }
    if (promises.length === 0) {
      return;
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      logger.error({ error }, `Error in awaiting updates`);
    }
    await this.broadcastLoad();
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
      logger.info(
        { gameId: this.gameId, newbie, users: this.users },
        `Game newbie`
      );
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

      logger.info(
        { gameId: this.gameId, leaver, users: this.users },
        `Game leave`
      );

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
      await this.networkSystem.loadObserver(observer);
    } else if (user) {
      user.load = true;
      logger.debug(
        { gameId: this.gameId, connectionId, users: this.users },
        `Game load`
      );
      await this.networkSystem.load(user, this.context.turn);
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
