import GameStage from "../GameStage";

export default class Ticker {
  private readonly startMillis: number = Date.now();
  private ageBefore = -1;

  constructor(
    public readonly stage: GameStage,
    private readonly aliveMillis: number
  ) {}

  public get age(): number {
    return this.calculateAge();
  }

  public isAlive = (): boolean => this.elapsed() < this.aliveMillis;

  public checkAgeChanged = async (
    onChanged: (stage: GameStage, age: number) => Promise<unknown>
  ): Promise<void> => {
    const newAge = this.calculateAge();
    if (this.ageBefore === newAge) {
      return;
    }
    this.ageBefore = newAge;
    await onChanged(this.stage, newAge);
  };

  private calculateAge = (): number => Math.floor(this.elapsed() / 1000);

  private elapsed = () => Date.now() - this.startMillis;
}
