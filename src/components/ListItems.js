import * as React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

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
        <ListItemText primary="Estate" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/users");
        }}
      >
        <ListItemIcon>
          <SupervisedUserCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/faculty");
        }}
      >
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary="Faculty" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/category");
        }}
      >
        <ListItemIcon>
          <CategoryIcon />
        </ListItemIcon>
        <ListItemText primary="Category" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/inventories");
        }}
      >
        <ListItemIcon>
          <InventoryIcon />
        </ListItemIcon>
        <ListItemText primary="Inventories" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          history.push("/qr");
        }}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Create QR" />
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
