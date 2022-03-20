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
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";

import { Formik } from "formik";
import * as yup from "yup";

import estateApi from "../axios/estate";
import Cookies from "js-cookie";
import moment from "moment";
import { Context } from "../context/authContext";
import cryptoJs from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "objectId",
    numeric: true,
    disablePadding: false,
    label: "ObjectID",
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

export default function EnhancedTable() {
  const { addEstate, deleteEstate } = React.useContext(Context);

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [estateData, setEstateData] = React.useState([]);
  const [renderData, setRenderData] = React.useState(false);
  const [role, setRole] = React.useState("");

  const cryptoData = (value, type) => {
    const bytes = cryptoJs.AES.decrypt(value, `secret ${type}`);
    const originalValue = bytes.toString(cryptoJs.enc.Utf8);
    return originalValue;
  };

  React.useEffect(() => {
    const getData = async () => {
      const token = await Cookies.get("auth");
      const role = await Cookies.get("role");
      const originalRole = cryptoData(role, "role");
      setRole(originalRole);
      const bytes = await cryptoJs.AES.decrypt(token, "secret token");
      const originalToken = await bytes.toString(cryptoJs.enc.Utf8);
      const response = await estateApi.get("/estates", {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      const data = await response.data.data.estates;
      setEstateData(data);
      setRenderData(false);
    };
    getData();
  }, [renderData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = estateData.map((n) => n._id);
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - estateData.length) : 0;

  const addEstateValidationSchema = yup.object().shape({
    name: yup.string().required("Name estate is required").trim(),
  });

  return (
    <Box fullWidth>
      <Formik
        validationSchema={addEstateValidationSchema}
        initialValues={{ name: "" }}
        onSubmit={addEstate}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          isValid,
        }) => (
          <Container component="main">
            <CssBaseline />
            <Box
              sx={{
                pr: 2,
                pl: 2,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Box component="form" onSubmit={handleSubmit} flex={5}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Estate name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus
                />
                {errors.email && (
                  <Typography
                    fontSize={16}
                    component="h1"
                    variant="h5"
                    color="#d32f2f"
                  >
                    {errors.email}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  ml: 2,
                  display: "flex",
                  flexDirection: "row",
                  flex: 1,
                }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setRenderData(true);
                    handleSubmit();
                    toast.success("Thêm thành công");
                  }}
                  disabled={!isValid}
                  sx={{ mt: 2, mb: 1 }}
                >
                  Add Estate
                </Button>
                <ToastContainer autoClose={2000} />
              </Box>
            </Box>
          </Container>
        )}
      </Formik>
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
              Estate
            </Typography>
          )}

          {role === "admin" && selected.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton
                onClick={() => {
                  deleteEstate(selected);
                  setRenderData(true);
                  toast.success("Xóa thành công");
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Filter list">
              <IconButton>
                <FilterListIcon />
              </IconButton>
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
              rowCount={estateData.length}
            />
            <TableBody>
              {stableSort(estateData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  const isItemSelected = isSelected(item._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, item._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={item._id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
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
                      <TableCell align="right">{item.status}</TableCell>
                      <TableCell align="right">{item._id}</TableCell>
                      <TableCell align="right">
                        {" "}
                        {moment(item.createdAt).format("DD-MM-YYYY HH:mm")}
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
          count={estateData.length}
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
}
