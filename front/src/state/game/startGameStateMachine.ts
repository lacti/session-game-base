import GameRequest from "./models/request/GameRequest";
import GameStart from "./models/GameStart";
import GlobalStage from "../global/models/GlobalStage";
import buildGameConnectionUrl from "./buildGameConnectionUrl";
import getGlobalStateValue from "../global/getGlobalStateValue";
import handleSocketClose from "./handleSocketClose";
import handleSocketError from "./handleSocketError";
import handleSocketMessageWith from "./handleSocketMessageWith";
import newGameContext from "./newGameContext";
import sleep from "../../utils/sleep";
import updateGlobalState from "../global/updateGlobalState";

const deferredDisconnectDelayMillis = 500;
const deferredLoadDelayMillis = 100;

export default function startGameStateMachine(start: GameStart) {
  const connectionUrl = buildGameConnectionUrl(start);
  console.info("Connect the game server with", connectionUrl);

  updateGlobalState({
    stage: GlobalStage.GameStarting,
    currentGameId: start.gameId,
  });
  const gameSocket = new WebSocket(connectionUrl);

  function sendRequest(request: GameRequest) {
    console.info("Send a message into the server", start.gameId, request);
    gameSocket.send(JSON.stringify(request));
  }

  function onSocketOpen() {
    // Step 1. Start to send a message via this socket.
    updateGlobalState({
      stage: GlobalStage.GameUserWaiting,
      currentGameId: start.gameId,
      gameContext: newGameContext(),
      send: onThisGame(sendRequest),
    });
    sleep(deferredLoadDelayMillis).then(() => {
      sendRequest({
        type: "load",
      });
    });
  }

  function onThisGame<Args extends any[]>(work: (...args: Args) => void) {
    return (...args: Args) => {
      if (getGlobalStateValue("currentGameId") !== start.gameId) {
        console.error("Socket is too old");
        return;
      }
      work(...args);
    };
  }

  gameSocket.addEventListener("open", onThisGame(onSocketOpen));
  gameSocket.addEventListener("error", onThisGame(handleSocketError));
  gameSocket.addEventListener(
    "message",
    onThisGame(
      handleSocketMessageWith({ gameSocket, deferredDisconnectDelayMillis })
    )
  );
  return new Promise<void>((resolve) => {
    gameSocket.addEventListener(
      "close",
      onThisGame(handleSocketClose(resolve))
    );
  });
}
