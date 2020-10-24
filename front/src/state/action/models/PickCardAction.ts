export default interface PickCardAction {
  type: "pickCard";
  payload: {
    cardIndex: number;
  };
}
