import * as React from "react";

import GameContext from "../state/game/models/GameContext";

export default function GameView({ context }: { context: GameContext }) {
  return (
    <div className="App">
      Happy, game! <pre>{JSON.stringify(context, null, 2)}</pre>
    </div>
  );
}
