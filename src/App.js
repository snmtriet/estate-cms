import React, { useContext, useEffect } from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import { Context } from "./context/authContext";
import { InventoryDetail } from "./components/InventoryDetail";

export default function App() {
  const { tryLocalSignin } = useContext(Context);

  useEffect(() => {
    tryLocalSignin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/category" component={Dashboard} />
      <Route path="/users" component={Dashboard} />
      <Route path="/faculty" component={Dashboard} />
      <Route path="/inventories/:inventoryId" component={InventoryDetail} />
      <Route path="/inventories" component={Dashboard} />
      <Route path="/qr" component={Dashboard} />
      <Route exact path="/" component={Dashboard} />
    </Switch>
  );
}
