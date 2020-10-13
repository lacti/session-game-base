import EndBroadcast from "../response/models/EndBroadcast";
import EnterBroadcast from "../response/models/EnterBroadcast";
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

  public async newbie(newbie: GameUser): Promise<void> {
    await broadcast<EnterBroadcast>(
      this.connectionIds.filter((id) => id !== newbie.connectionId),
      { type: "enter", newbie: { index: newbie.index, color: newbie.color } }
    );
  }

  public async load(
    user: GameUser,
    stage: GameStage,
    age: number
  ): Promise<void> {
    await reply<LoadResponse>(user.connectionId, {
      type: "load",
      me: user,
      users: this.users,
      stage,
      age,
    });
  }

  public async loadObserver(
    user: GameObserver,
    stage: GameStage,
    age: number
  ): Promise<void> {
    await reply<LoadResponse>(user.connectionId, {
      type: "load",
      users: this.users,
      stage,
      age,
      observer: true,
    });
  }

  public async stage(stage: GameStage, age: number): Promise<void> {
    await Promise.all(
      [
        ...this.users.map((u) => u.connectionId),
        ...this.observers.map((u) => u.connectionId),
      ].map((connectionId) =>
        reply<StageBroadcast>(connectionId, { type: "stage", stage, age })
      )
    );
  }
}
