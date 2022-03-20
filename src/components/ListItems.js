import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UpdateIcon from "@mui/icons-material/Update";
import InventoryIcon from "@mui/icons-material/Inventory";

import { Context } from "../context/authContext";
import { useHistory } from "react-router-dom";

export const MainListItems = () => {
  let history = useHistory();
  return (
    <>
      <ListItemButton
        onClick={() => {
          history.push("/");
        }}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/addestate");
        }}
      >
        <ListItemIcon>
          <AddCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Add Estate" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <UpdateIcon />
        </ListItemIcon>
        <ListItemText primary="Update Estate" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <InventoryIcon />
        </ListItemIcon>
        <ListItemText primary="Inventory" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
        <ListItemText primary="Integrations" />
      </ListItemButton>
    </>
  );
};

export const SecondaryListItems = () => {
  const { signout } = React.useContext(Context);
  return (
    <>
      <ListSubheader component="div" inset>
        Authentication
      </ListSubheader>
      <ListItemButton onClick={signout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Đăng xuất" />
      </ListItemButton>
    </>
  );
};
