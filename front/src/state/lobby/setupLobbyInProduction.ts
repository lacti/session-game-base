import GameStart from "../game/models/GameStart";

const authUrl = process.env.REACT_APP_AUTH_URL!;
const lobbyUrl = process.env.REACT_APP_LOBBY_URL!;
const gameApplicationId = process.env.REACT_APP_GAME_APPLICATION_ID!;
const userName = "Player";

export default async function setupLobbyInProduction() {
  return new Promise<GameStart>(async (resolve, reject) => {
    const authToken = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        applications: [gameApplicationId],
      }),
    })
      .then((token) => token.text())
      .catch(reject);
    if (authToken === undefined) {
      return;
    }

    const ws = new WebSocket(
      lobbyUrl + "?authorization=" + encodeURIComponent(authToken)
    );
    ws.onerror = reject;
    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: "match", application: gameApplicationId })
      );
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as GameStart;
      resolve(message);
    };
  });
}
