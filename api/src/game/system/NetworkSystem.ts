import EndBroadcast from "../response/models/EndBroadcast";
import GameContext from "../context/GameContext";
import GameObserver from "../user/models/GameObserver";
import GameStage from "../GameStage";
import GameUser from "../user/models/GameUser";
import LoadResponse from "../response/models/LoadResponse";
import StageBroadcast from "../response/models/StageBroadcast";
import broadcast from "../response/broadcast";
import reply from "../response/reply";

export default class NetworkSystem {
  constructor(
    private readonly users: GameUser[],
    private readonly observers: GameObserver[],
    private readonly context: GameContext
  ) {
    console.log(this.context);
  }

  public get connectionIds(): string[] {
    return [
      ...this.users.map((u) => u.connectionId).filter(Boolean),
      ...this.observers.map((o) => o.connectionId).filter(Boolean),
    ];
  }

  public async end(): Promise<void> {
    await broadcast<EndBroadcast>(this.connectionIds, {
      type: "end",
    });
  }

  public async load(user: GameUser, currentTurn: number): Promise<void> {
    await reply<LoadResponse>(user.connectionId, {
      type: "load",
      payload: {
        me: user,
        enemy: this.users.filter((u) => u !== user)[0],
        myTurn: user.index === currentTurn,
      },
    });
  }

  public async loadObserver(user: GameObserver): Promise<void> {
    await reply<LoadResponse>(user.connectionId, {
      type: "load",
      payload: {
        users: this.users,
        observer: true,
      },
    });
  }

  public async stage(stage: GameStage, age: number): Promise<void> {
    await Promise.all(
      [
        ...this.users.map((u) => u.connectionId),
        ...this.observers.map((u) => u.connectionId),
      ].map((connectionId) =>
        reply<StageBroadcast>(connectionId, {
          type: "stage",
          payload: { stage, age },
        })
      )
    );
  }
}
