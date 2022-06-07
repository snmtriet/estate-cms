import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import QrCodeIcon from "@mui/icons-material/QrCode";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { Formik } from "formik";
import * as yup from "yup";
import Cookies from "js-cookie";
import moment from "moment";
import cryptoJs from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createFilterOptions } from "@mui/material/Autocomplete";
import {
  Autocomplete,
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
  DialogActions,
  Button,
  CssBaseline,
  TextField,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  DialogContentText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import QRCode from "qrcode.react";

import estateApi from "../axios/estate";
import { Context } from "../context/authContext";

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
    id: "category",
    numeric: true,
    disablePadding: false,
    label: "Category",
  },
  {
    id: "updatedAt",
    numeric: true,
    disablePadding: false,
    label: "updatedAt",
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

const enumStatus = [
  { _id: 1, status: "Đã mất" },
  { _id: 2, status: "Đang sử dụng" },
  { _id: 3, status: "Hư hỏng chờ sửa chữa" },
  { _id: 4, status: "Hư hỏng xin thanh lý" },
  { _id: 5, status: "Không nhu cầu sử dụng" },
];

export default function EnhancedTable() {
  const { addEstate, updateEstate, deleteEstate } = React.useContext(Context);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [estateData, setEstateData] = React.useState([]);
  const [renderData, setRenderData] = React.useState(false);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [nameEstate, setNameEstate] = React.useState("");
  const [statusEstate, setStatusEstate] = React.useState("");
  const [statusName, setStatusName] = React.useState("");
  const [objUpdate, setObjUpdate] = React.useState({});
  const [categoryData, setCategoryData] = React.useState([]);
  const [qrValue, setQrValue] = React.useState({});

  const cryptoData = (value, type) => {
    const bytes = cryptoJs.AES.decrypt(value, `secret ${type}`);
    const originalValue = bytes.toString(cryptoJs.enc.Utf8);
    return originalValue;
  };
  React.useEffect(() => {
    const getData = async () => {
      const token = await Cookies.get("auth");
      const originalToken = cryptoData(token, "token");
      const resEstate = await estateApi.get("/estates", {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      const resCategory = await estateApi.get("/categories", {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      const dataEstate = await resEstate.data.data.estates;
      const dataCategory = await resCategory.data.data.category;
      setEstateData(dataEstate);
      setCategoryData(dataCategory);
      setRenderData(false);
    };
    getData();
    return () => {
      setEstateData([]);
      setCategoryData([]);
    };
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

  const filterOptionsStatus = createFilterOptions({
    matchFrom: "start",
    stringify: (option) => option.status,
  });
  const filterOptionsCategory = createFilterOptions({
    matchFrom: "start",
    stringify: (option) => option.category.name,
  });

  const uniqueStatusEstate = [
    ...new Map(estateData.map((item) => [item["status"], item])).values(),
  ];
  const uniqueCategoryEstate = [
    ...new Map(
      estateData.map((item) => [item.category["name"], item])
    ).values(),
  ];

  // download QR code
  const downloadQRCode = (name) => {
    const qrCodeURL = document
      .getElementById("qrCodeEl")
      .toDataURL("image/png", 1.0)
      .replace("image/png", "image/octet-stream");
    let aEl = document.createElement("a");
    aEl.href = qrCodeURL;
    aEl.download = `${name}.png`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  return (
    <Box fullWidth>
      <Formik
        validationSchema={addEstateValidationSchema}
        initialValues={{ name: "", category: "" }}
        onSubmit={(values) => {
          addEstate(values.name, values.category);
          if (values.category === "") {
            toast.warn("Chưa chọn thể loại");
          } else {
            toast.success("Thêm thành công");
            values.name = "";
            values.category = "";
          }
        }}
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
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <FormControl sx={{ mr: 1, ml: 1, mt: 0.5, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-autowidth-label">
                    Category
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={values.category}
                    name="category"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoWidth
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categoryData.map((item) => {
                      return (
                        <MenuItem key={item._id} value={item._id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
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

          {selected.length > 0 ? (
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
                  Delete Estate
                </DialogTitle>
                <DialogContent>
                  <DialogContentText fontWeight="bold" fontSize={18}>
                    Hành động này sẽ xóa vĩnh viễn tài sản. Bạn có thực sự muốn
                    xóa ?
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
                      setSelected([]);
                      deleteEstate(selected);
                      toast.success("Xóa thành công");
                      setOpen2(false);
                      setRenderData(true);
                    }}
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Tooltip title="Filter list">
              <>
                <Autocomplete
                  id="filter-status"
                  options={uniqueStatusEstate}
                  isOptionEqualToValue={(option, value) =>
                    option.status === value.status
                  }
                  getOptionLabel={(option) => option.status}
                  filterOptions={filterOptionsStatus}
                  sx={{ width: 300 }}
                  onChange={(e, value) => {
                    if (value) {
                      const filterData = estateData.filter((item) => {
                        return item.status === value.status;
                      });
                      setEstateData(filterData);
                    } else {
                      setRenderData(true);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="filterStatus"
                      label="Filter status"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
                <Autocomplete
                  id="filter-category"
                  options={uniqueCategoryEstate}
                  isOptionEqualToValue={(option, value) =>
                    option.category.name === value.category.name
                  }
                  getOptionLabel={(option) => option.category.name}
                  filterOptions={filterOptionsCategory}
                  sx={{ width: 400, ml: 1 }}
                  onChange={(e, value) => {
                    if (value) {
                      const filterData = estateData.filter((item) => {
                        return item.category.name === value.category.name;
                      });
                      setEstateData(filterData);
                    } else {
                      setRenderData(true);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="filterCategory"
                      label="Filter category"
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
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.status}</TableCell>
                      <TableCell align="right">{item.category.name}</TableCell>
                      <TableCell align="right">
                        {" "}
                        {moment(item.updatedAt).format("DD-MM-YYYY HH:mm")}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        {moment(item.createdAt).format("DD-MM-YYYY HH:mm")}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setQrOpen(true);
                            setQrValue({ id: item._id, name: item.name });
                          }}
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            const EstateUpdateById = estateData.filter(
                              (estate) => {
                                return estate._id === item._id;
                              }
                            );
                            setObjUpdate(EstateUpdateById);
                            setNameEstate(EstateUpdateById[0].name);
                            setStatusEstate(EstateUpdateById[0].status);
                            setOpen(true);
                          }}
                        >
                          <UpdateIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              <>
                {/* qr generate open */}
                <Dialog
                  open={qrOpen}
                  onClose={() => {
                    setQrOpen(false);
                  }}
                >
                  <DialogTitle
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    color="#408CD8"
                  >
                    <QrCodeIcon color="info" style={{ marginRight: 5 }} />
                    QR Estate
                  </DialogTitle>
                  <DialogContent
                    sx={{
                      minWidth: 350,
                    }}
                  >
                    <Box
                      style={{
                        height: "auto",
                        margin: "0 auto",
                        width: "100%",
                      }}
                    >
                      <QRCode
                        id="qrCodeEl"
                        size={256}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        value={qrValue.id}
                        viewBox={`0 0 256 256`}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        setQrOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        downloadQRCode(qrValue.name);
                      }}
                    >
                      Download
                    </Button>
                  </DialogActions>
                </Dialog>
                {/* dialog update estate */}
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
                    Update Estate
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Name Estate"
                      type="text"
                      fullWidth
                      variant="outlined"
                      defaultValue={nameEstate}
                      onChange={(e) => {
                        setNameEstate(e.target.value);
                      }}
                    />
                    <FormControl>
                      <FormLabel id="demo-row-radio-buttons-group-label">
                        Status
                      </FormLabel>
                      <RadioGroup
                        defaultValue={statusEstate}
                        onChange={(e, value) => {
                          const option = enumStatus.find((estate) => {
                            return estate.status === value;
                          });
                          console.log({ option });
                          setStatusName(option.status);
                        }}
                      >
                        {enumStatus.map((estate) => (
                          <FormControlLabel
                            key={estate._id}
                            value={estate.status}
                            control={<Radio />}
                            label={estate.status}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
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
                        updateEstate(nameEstate, statusName, objUpdate);
                        setOpen(false);
                        toast.success("Cập nhật thành công");
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
