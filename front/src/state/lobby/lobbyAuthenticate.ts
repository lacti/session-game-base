import GameStart from "../game/models/GameStart";
import GlobalStage from "../global/models/GlobalStage";
import setupLobbyInLocal from "./setupLobbyInLocal";
import setupLobbyInProduction from "./setupLobbyInProduction";
import updateGlobalStage from "../global/updateGlobalStage";

export default async function lobbyAuthenticate(): Promise<GameStart> {
  updateGlobalStage(GlobalStage.LobbyWaiting);

  if (process.env.REACT_APP_LOCAL === "1") {
    return setupLobbyInLocal();
  } else {
    return setupLobbyInProduction();
  }
}
