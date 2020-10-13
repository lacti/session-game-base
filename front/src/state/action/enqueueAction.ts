import Action from "./models/Action";
import q from "./q";

export default function enqueueAction(action: Action) {
  q.push(action);
}
