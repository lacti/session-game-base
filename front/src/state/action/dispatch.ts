import ActionMap from "./models/ActionMap";
import dispatchServerMessage from "./dispatchServerMessage";
import workWithGlobalState from "../global/workWithGlobalState";

const dispatch: {
  [T in keyof ActionMap]: (action: ActionMap[T]) => void;
} = {
  serverResponse: function (action) {
    console.info(action);
    dispatchServerMessage[action.payload.type](action.payload as any);
  },
  pickCard: function (action) {
    console.info(action);
    workWithGlobalState("send", (send) => {
      send({
        type: "pickCard",
        payload: {
          cardIndex: action.payload.cardIndex,
        },
      });
    });
  },
};

export default dispatch;
