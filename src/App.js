import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import Login from "./pages/login"
import Loading from "./pages/loading";
import User from "./pages/user";

function App() {
  return (
    <Router>
      <Route path="/" exact component={Login} />
      <Route path="/loading" exact component={Loading} />
      <Route path="/user" component={User} />
    </Router>
  );
}

export default App;
