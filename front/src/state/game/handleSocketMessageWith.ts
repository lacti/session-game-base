import GameResponse from "./models/response/GameResponse";
import GameStage from "./models/GameStage";
import GlobalStage from "../global/models/GlobalStage";
import enqueueAction from "../action/enqueueAction";
import getGlobalStage from "../global/getGlobalStage";
import sleep from "../../utils/sleep";
import updateGlobalStage from "../global/updateGlobalStage";

export default function handleSocketMessageWith({
  gameSocket,
  deferredDisconnectDelayMillis,
}: {
  gameSocket: WebSocket;
  deferredDisconnectDelayMillis: number;
}) {
  return function onSocketMessage(event: MessageEvent) {
    // Step 4. Put a message from the server into the action queue.
    try {
      const response: GameResponse = JSON.parse(event.data);
      if (!response.type) {
        // Is server OK?
        console.error("Invalid response", response);
        return;
      }
      console.info("Server response", response);
      enqueueAction({
        type: "serverResponse",
        payload: response,
      });

      if (response.type === "stage") {
        if (
          response.payload.stage === GameStage.Running &&
          getGlobalStage() !== GlobalStage.GameRunning
        ) {
          console.info("Game is starting");
          updateGlobalStage(GlobalStage.GameRunning);
        }
      }
      if (response.type === "end") {
        console.info("Game is ended");
        updateGlobalStage(GlobalStage.GameEnd);
        sleep(deferredDisconnectDelayMillis).then(() => {
          if (gameSocket.readyState === WebSocket.CONNECTING) {
            gameSocket.close();
          }
        });
      }
    } catch (error) {
      // TODO Are we ok?
      console.error(event, error);
    }
  };
}
