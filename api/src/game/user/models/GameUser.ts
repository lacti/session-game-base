import User from "./User";

export default interface GameUser extends User {
  connectionId: string;
  memberId: string;
  load: boolean;

  hp: number;
  cards: number[];
}
