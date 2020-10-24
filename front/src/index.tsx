import "./index.css";

import GameView from './views/GameView';
import React from "react";
import ReactDOM from "react-dom";
import ViewMain from "./views/ViewMain";
import newDebugGameContext from './state/game/debug/newDebugGameContext';
import startStateMachine from "./state/startStateMachine";

if (window.location.href.includes('debug=1')) {
  ReactDOM.render(<GameView context={newDebugGameContext()} />, document.getElementById("root"));

} else {
  ReactDOM.render(<ViewMain />, document.getElementById("root"));
  startStateMachine().catch(console.error);
}