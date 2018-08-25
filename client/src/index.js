import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./Components/App";
import "bootstrap/dist/css/bootstrap.min.css";

import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
