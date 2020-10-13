import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import ViewMain from "./views/ViewMain";
import startStateMachine from "./state/startStateMachine";

ReactDOM.render(<ViewMain />, document.getElementById("root"));

startStateMachine().catch(console.error);
