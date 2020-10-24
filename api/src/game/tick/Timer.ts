import processTimer from "./processTimer";

export default class Timer {
  private readonly interval: number;

  private acc = 0;

  constructor(interval: number) {
    this.interval = interval;
  }

  public addDt(dt: number): number {
    const { multiple, remain } = processTimer(this.interval, this.acc, dt);
    this.acc = remain;
    return multiple;
  }
}
