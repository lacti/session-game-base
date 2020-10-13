import ActionMap from "./models/ActionMap";

const dispatch: {
  [T in keyof ActionMap]: (action: ActionMap[T]) => void;
} = {
  serverResponse: function (action) {
    console.info(action);
  },
};

export default dispatch;
