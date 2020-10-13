import GameStart from "../game/models/GameStart";
import sleep from "../../utils/sleep";

export default async function setupLobbyInLocal() {
  return new Promise<GameStart>(async (resolve, reject) => {
    const testStart = {
      gameId: "local-test-" + Date.now(),
      members: [{ memberId: "me" }, { memberId: "ob" }],
    };
    fetch("http://localhost:3000/debug?waitSetup=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testStart),
    })
      .then(console.log)
      .catch(reject);
    await sleep(500);
    resolve({
      gameId: testStart.gameId,
      playerId: testStart.members[0].memberId,
      url: "ws://localhost:3001",
    });
  });
}
