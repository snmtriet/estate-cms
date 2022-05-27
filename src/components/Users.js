import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import estateApi from "../axios/estate";
import Cookies from "js-cookie";
import moment from "moment";
import { Context } from "../context/authContext";
import cryptoJs from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DialogContentText } from "@mui/material";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "fullname",
    numeric: false,
    disablePadding: true,
    label: "Fullname",
  },
  {
    id: "email",
    numeric: true,
    disablePadding: false,
    label: "Email",
  },
  {
    id: "role",
    numeric: true,
    disablePadding: false,
    label: "Role",
  },
  {
    id: "faculty",
    numeric: true,
    disablePadding: false,
    label: "Faculty",
  },
  {
    id: "createdAt",
    numeric: true,
    disablePadding: false,
    label: "CreatedAt",
  },
  {
    id: "passwordChangedAt",
    numeric: true,
    disablePadding: false,
    label: "PasswordChangedAt",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export const Users = () => {
  const { deleteUser } = React.useContext(Context);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [userData, setUserData] = React.useState([]);
  const [renderData, setRenderData] = React.useState(false);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [role, setRole] = React.useState("");
  const [open2, setOpen2] = React.useState(false);

  const cryptoData = (value, type) => {
    const bytes = cryptoJs.AES.decrypt(value, `secret ${type}`);
    const originalValue = bytes.toString(cryptoJs.enc.Utf8);
    return originalValue;
  };
  React.useEffect(() => {
    const getData = async () => {
      const role = await Cookies.get("role");
      const token = await Cookies.get("auth");
      const originalRole = cryptoData(role, "role");
      const originalToken = cryptoData(token, "token");
      setRole(originalRole);
      const response = await estateApi.get("/users", {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      const data = await response.data.data.users;
      setUserData(data);
      setRenderData(false);
    };
    getData();
    return () => {
      setUserData([]);
    };
  }, [renderData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = userData.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, _id) => {
    const selectedIndex = selected.indexOf(_id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (_id) => {
    return selected.indexOf(_id) !== -1;
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userData.length) : 0;

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option) => option.role,
  });

  const uniqueRoleUser = [
    ...new Map(userData.map((item) => [item["role"], item])).values(),
  ];

  return (
    <Box fullWidth>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: "1 1 100%" }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: "1 1 100%" }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              User
            </Typography>
          )}

          {role === "admin" && selected.length > 0 ? (
            <>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => {
                    setOpen2(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Dialog
                open={open2}
                onClose={() => {
                  setOpen2(false);
                }}
                aria-labelledby="draggable-dialog-title"
              >
                <DialogTitle
                  id="draggable-dialog-title"
                  display="flex"
                  alignItems="center"
                  color="error"
                >
                  <DeleteIcon color="error" />
                  Delete User
                </DialogTitle>
                <DialogContent>
                  <DialogContentText fontWeight="bold" fontSize={18}>
                    Bạn có thực sự muốn xóa ?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    autoFocus
                    onClick={() => {
                      setOpen2(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      deleteUser(selected);
                      setSelected([]);
                      toast.success("Xóa thành công");
                      setOpen2(false);
                      setRenderData(true);
                    }}
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
              <ToastContainer autoClose={2000} />
            </>
          ) : (
            <Tooltip title="Filter list">
              <>
                <Autocomplete
                  id="filter-role"
                  options={uniqueRoleUser}
                  isOptionEqualToValue={(option, value) =>
                    option.role === value.role
                  }
                  getOptionLabel={(option) => option.role}
                  filterOptions={filterOptions}
                  sx={{ width: 300 }}
                  onChange={(e, value) => {
                    if (value) {
                      const filterData = userData.filter((item) => {
                        return item.role === value.role;
                      });
                      setUserData(filterData);
                    } else {
                      setRenderData(true);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="roles"
                      label="Filter roles"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </>
            </Tooltip>
          )}
        </Toolbar>

        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={userData.length}
            />
            <TableBody>
              {stableSort(userData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  const isItemSelected = isSelected(item._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      // onClick={(event) => handleClick(event, item._id)}
                      role="checkbox"
                      // aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={item._id}
                      // selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          aria-checked={isItemSelected}
                          onClick={(event) => handleClick(event, item._id)}
                          selected={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {item.fullname}
                      </TableCell>
                      <TableCell align="right">{item.email}</TableCell>
                      <TableCell align="right">{item.role}</TableCell>
                      <TableCell align="right">{item.faculty.name}</TableCell>
                      <TableCell align="right">
                        {moment(item.createdAt).format("DD-MM-YYYY HH:mm")}
                      </TableCell>
                      <TableCell align="right">
                        {item.passwordChangedAt &&
                          moment(item.passwordChangedAt).format(
                            "DD-MM-YYYY HH:mm"
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={userData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
};
