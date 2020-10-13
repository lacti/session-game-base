import * as React from "react";

import GameContext from "../state/game/models/GameContext";
import GameEndView from "./GameEndView";
import GameView from "./GameView";
import GlobalStage from "../state/global/models/GlobalStage";
import LoadingView from "./LoadingView";
import getCurrentGameContext from "../state/global/getCurrentGameContext";
import getGlobalStage from "../state/global/getGlobalStage";

const renderIntervalMillis = 33;

export default function ViewMain() {
  const [context, setContext] = React.useState<GameContext>(
    getCurrentGameContext()
  );
  React.useEffect(() => {
    const timer = setInterval(() => {
      setContext({ ...getCurrentGameContext() });
    }, renderIntervalMillis);
    return () => clearInterval(timer);
  }, []);

  switch (getGlobalStage()) {
    case GlobalStage.Initialized:
    case GlobalStage.LobbyWaiting:
    case GlobalStage.GameStarting:
    case GlobalStage.GameUserWaiting:
      return <LoadingView context={context} />;
    case GlobalStage.GameRunning:
    case GlobalStage.GameError:
      return <GameView context={context} />;
    case GlobalStage.GameEnd:
      return <GameEndView context={context} />;
    default:
      return <div>Broken!</div>;
  }
}
