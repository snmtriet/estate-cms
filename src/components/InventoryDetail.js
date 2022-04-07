import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FaceIcon from "@mui/icons-material/Face";
import { MainListItems, SecondaryListItems } from "./ListItems";
import { useParams } from "react-router-dom";
import moment from "moment";
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  viVN,
} from "@mui/x-data-grid";

import Cookies from "js-cookie";
import estate from "../axios/estate";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();

function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const [name, setName] = React.useState("");
  const [rows, setRows] = React.useState([]);

  const { inventoryId } = useParams();

  React.useEffect(() => {
    const getName = async () => {
      const name = await Cookies.get("name");
      setName(name);
      const inventoriesData = await estate.get(`/inventories/${inventoryId}`);

      const rows = inventoriesData.data.data.inventory.checkList.map(
        (item, index) => {
          return {
            id: index + 1,
            name: item.name,
            soluong: item.totalEstate,
            dm: 0,
            ...item.statistics,
          };
        }
      );
      setRows(rows);
    };
    getName();
  }, [inventoryId]);

  const columns = [
    { field: "name", headerName: "Loại", width: 250 },
    {
      field: "soluong",
      headerName: "Sô lượng",
      type: "number",
    },
    {
      field: "dsd",
      headerName: "Đang sử dụng",
      type: "number",
      width: 250,
    },
    {
      field: "hhxtl",
      headerName: "Hư hỏng xin thanh lý",
      type: "number",
      width: 250,
    },
    {
      field: "hhcsc",
      headerName: "Hư hỏng chờ sửa chữa",
      type: "number",
      width: 250,
    },
    {
      field: "dm",
      headerName: "Đã mất",
      type: "number",
      width: 250,
      editable: true,
    },
    {
      field: "note",
      headerName: "Ghi chú",
      width: 250,
    },
  ];

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => {
                setOpen(!open);
              }}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
            <IconButton color="inherit">
              <FaceIcon />
            </IconButton>
            <Typography component="h6" variant="h6" color="inherit" noWrap>
              {name}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton
              onClick={() => {
                setOpen(!open);
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems />
            <Divider sx={{ my: 1 }} />
            <SecondaryListItems />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="2xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div style={{ height: 300, width: "100%" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    components={{
                      Toolbar: CustomToolbar,
                    }}
                    experimentalFeatures={{ newEditingApi: true }}
                    localeText={
                      viVN.components.MuiDataGrid.defaultProps.localeText
                    }
                  />
                </div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport
        csvOptions={{
          fileName: `Bang KiemKeTS_KCNTT ${moment(Date.now()).format(
            "DD-MM-YYYY"
          )}`,
          delimiter: ";",
          utf8WithBom: true,
        }}
      />
    </GridToolbarContainer>
  );
}

export const InventoryDetail = () => {
  return <DashboardContent />;
};
