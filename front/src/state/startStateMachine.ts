import GlobalStage from "./global/models/GlobalStage";
import lobbyAuthenticate from "./lobby/lobbyAuthenticate";
import startGameStateMachine from "./game/startGameStateMachine";
import startProcessActionQueue from "./action/startProcessActionQueue";
import waitGlobalStage from "./global/waitGlobalStage";

export default async function startStateMachine() {
  // Step 1. Install input device processor.
  startProcessActionQueue();

  try {
    while (true) {
      // Step 2. Work with lobby.
      const start = await lobbyAuthenticate();

      // Step 3. connect with game.
      await startGameStateMachine(start);

      // Step 4. Wait until starting a new game.
      await waitGlobalStage(GlobalStage.Initialized);
    }
  } catch (error) {
    console.error("State machine is broken :)", error);
  }
}
