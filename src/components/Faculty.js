import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import { Context } from "../context/authContext";
import estateApi from "../axios/estate";
import Cookies from "js-cookie";
import moment from "moment";
import cryptoJs from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import UpdateIcon from "@mui/icons-material/Update";

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
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  {
    id: "describe",
    numeric: true,
    disablePadding: false,
    label: "Describe",
  },
  {
    id: "createdAt",
    numeric: true,
    disablePadding: false,
    label: "CreatedAt",
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

export const Faculty = () => {
  const { updateFaculty } = React.useContext(Context);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [facultyData, setFacultyData] = React.useState([]);
  const [renderData, setRenderData] = React.useState(false);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [role, setRole] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [nameFaculty, setNameFaculty] = React.useState("");
  const [describeFaculty, setDescribeFaculty] = React.useState("");
  const [idFacultyUpdate, setIdFacultyUpdate] = React.useState(null);

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
      const response = await estateApi.get("/faculties", {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      const data = await response.data.data.faculty;
      setFacultyData(data);
      setRenderData(false);
    };
    getData();
    return () => {
      setFacultyData([]);
    };
  }, [renderData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = facultyData.map((n) => n._id);
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - facultyData.length) : 0;

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
              Faculty
            </Typography>
          )}

          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
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
              rowCount={facultyData.length}
            />
            <TableBody>
              {stableSort(facultyData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  const isItemSelected = isSelected(item._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={item._id}
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
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.describe}</TableCell>
                      <TableCell align="right">
                        {moment(item.createdAt).format("DD-MM-YYYY HH:mm")}
                      </TableCell>
                      {role === "admin" && (
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              const FacultyUpdateById = facultyData.filter(
                                (estate) => {
                                  return estate._id === item._id;
                                }
                              );
                              setNameFaculty(FacultyUpdateById[0].name);
                              setDescribeFaculty(FacultyUpdateById[0].describe);
                              setIdFacultyUpdate(FacultyUpdateById[0]._id);
                              setOpen(true);
                            }}
                          >
                            <UpdateIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              <>
                <Dialog
                  open={open}
                  onClose={() => {
                    setOpen(false);
                  }}
                >
                  <DialogTitle
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    color="#408CD8"
                  >
                    <UpdateIcon color="info" style={{ marginRight: 5 }} />
                    Update Faculty
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Name Faculty"
                      type="text"
                      fullWidth
                      variant="outlined"
                      defaultValue={nameFaculty}
                      onChange={(e) => {
                        setNameFaculty(e.target.value);
                      }}
                    />
                    <TextField
                      autoFocus
                      margin="dense"
                      id="describe"
                      label="Describe Faculty"
                      type="text"
                      fullWidth
                      variant="outlined"
                      defaultValue={describeFaculty}
                      onChange={(e) => {
                        setDescribeFaculty(e.target.value);
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        updateFaculty(
                          nameFaculty,
                          describeFaculty,
                          idFacultyUpdate
                        );
                        toast.success("Cập nhật thành công");
                        setOpen(false);
                        setRenderData(true);
                      }}
                    >
                      Update
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
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
        <ToastContainer autoClose={2000} />
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={facultyData.length}
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
