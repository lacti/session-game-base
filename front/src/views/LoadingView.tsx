import * as React from "react";

import GameContext from "../state/game/models/GameContext";

export default function LoadingView({ context: {stage, age} }: { context: GameContext }) {
  return <div className="App">Wait users... [{stage}/{age}]</div>;
}
