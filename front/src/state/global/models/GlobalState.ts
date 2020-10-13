import GlobalStateMethod from "./GlobalStateMethod";
import GlobalStateValue from "./GlobalStateValue";

export default interface GlobalState
  extends GlobalStateValue,
    GlobalStateMethod {}
