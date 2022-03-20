import React, { useContext, useEffect } from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import { Context } from "./context/authContext";

export default function App() {
  const { tryLocalSignin } = useContext(Context);

  useEffect(() => {
    tryLocalSignin();
  }, []);

  return (
    <Switch>
      <Route exact path="/" component={Dashboard} />
      <Route path="/signin" component={SignIn} />
      <Route path="/addestate" component={Dashboard} />
    </Switch>
  );
}
