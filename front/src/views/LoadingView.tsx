import * as React from "react";

import GameContext from "../state/game/models/GameContext";

export default function LoadingView({ context }: { context: GameContext }) {
  return <div className="App">Wait other users...</div>;
}
