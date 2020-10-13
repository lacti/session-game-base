import GameMember from "./GameMember";

export default interface GameActorStartEvent {
  gameId: string;
  members: GameMember[];
  callbackUrl?: string;
}
