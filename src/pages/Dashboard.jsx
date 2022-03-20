import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { Context } from "../context/authContext";
import DashBoard from "../components/Dashboard";

const Dashboard = () => {
  const { state } = useContext(Context);
  if (!state.token) {
    return <Redirect to="/signin" />;
  }

  return (
    <div>
      <DashBoard />
    </div>
  );
};

export default Dashboard;
