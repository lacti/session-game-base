import GameContext from "./GameContext";
import Ticker from "../tick/Ticker";

export default function isEndOfGame(
  context: GameContext,
  ticker: Ticker
): boolean {
  console.log(context, ticker);
  return context.user1.hp <= 0 || context.user2.hp <= 0;
}
