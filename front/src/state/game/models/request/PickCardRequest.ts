export default interface PickCardRequest {
  type: "pickCard";
  payload: {
    cardIndex: number;
  };
}
