import * as React from "react";

import GameContext from "../state/game/models/GameContext";

export default function GameEndView({ context }: { context: GameContext }) {
  return <div className="App">Game over!</div>;
}
