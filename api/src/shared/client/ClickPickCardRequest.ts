// Define the type of game messages from the client.
export default interface ClickPickCardRequest {
  type: "pickCard";
  payload: {
    cardIndex: number;
  };
}
