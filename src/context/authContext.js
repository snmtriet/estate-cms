import createDataContext from "./createDataContext";
import estateApi from "../axios/estate";
import Cookies from "js-cookie";
import { Redirect } from "react-router-dom";
import cryptoJs from "crypto-js";

const authReducer = (state, action) => {
  switch (action.type) {
    case "signin":
      return {
        token: action.payload,
      };
    case "signout":
      return { token: null };
    case "add_error":
      return { ...state, errMessage: action.payload };
    default:
      return state;
  }
};

const tryLocalSignin = (dispatch) => async () => {
  const token = await Cookies.get("auth");
  if (token) {
    dispatch({ type: "signin", payload: token });
    return <Redirect to="/dashboard" />;
  } else {
    return <Redirect to="/signin" />;
  }
};

const getToken = async () => {
  const token = await Cookies.get("auth");
  const bytes = await cryptoJs.AES.decrypt(token, "secret token");
  const originalToken = await bytes.toString(cryptoJs.enc.Utf8);
  return originalToken;
};

const addEstate = (dispatch) => async (name, category) => {
  name = name.trim();
  try {
    await estateApi.post("/estates", {
      name,
      category,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateEstate = (dispatch) => async (name, status, obj) => {
  const id = obj[0]._id;
  try {
    const originalToken = await getToken();
    var params;
    if (name && !status) {
      params = { name };
    } else if (!name && status) {
      params = { status };
    } else {
      params = { name, status };
    }

    await estateApi.patch(`/estates/${id}`, params, {
      headers: {
        Authorization: `Bearer ${originalToken}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteEstate = (dispatch) => async (listEstate) => {
  try {
    const originalToken = await getToken();
    listEstate.map(async (id) => {
      await estateApi.delete(`/estates/${id}`, {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const signin =
  (dispatch) =>
  async ({ email, password }) => {
    try {
      const response = await estateApi.post("/users/signin", {
        email,
        password,
      });
      const token = response.data.token;
      const role = response.data.data.user.role;
      const cipherRole = await cryptoJs.AES.encrypt(
        role,
        "secret role"
      ).toString();
      const cipherToken = await cryptoJs.AES.encrypt(
        token,
        "secret token"
      ).toString();
      await Cookies.set("auth", cipherToken, {
        expires: 90,
      });
      await Cookies.set("role", cipherRole, {
        expires: 90,
      });
      await Cookies.set("name", response.data.data.user.fullname, {
        expires: 90,
      });

      dispatch({ type: "signin", payload: token });
    } catch (err) {
      dispatch({ type: "add_error", payload: err.response.data.message });
    }
  };

const deleteUser = (dispatch) => async (UserIds) => {
  try {
    const originalToken = await getToken();
    UserIds.map(async (id) => {
      await estateApi.patch(
        `/users/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${originalToken}`,
          },
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const addCategory = (dispatch) => async (name) => {
  name = name.trim();
  try {
    await estateApi.post("/categories", {
      name,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteCategory = (dispatch) => async (CategoryIds) => {
  try {
    const originalToken = await getToken();
    CategoryIds.map(async (id) => {
      await estateApi.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = (dispatch) => async (name, describe, id) => {
  try {
    const originalToken = await getToken();
    var params;
    if (name && !describe) {
      params = { name };
    } else if (!name && describe) {
      params = { describe };
    } else {
      params = { name, describe };
    }

    await estateApi.patch(`/categories/${id}`, params, {
      headers: {
        Authorization: `Bearer ${originalToken}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const updateFaculty = (dispatch) => async (name, describe, id) => {
  const originalToken = await getToken();
  var params;
  if (name && !describe) {
    params = { name };
  } else if (!name && describe) {
    params = { describe };
  } else {
    params = { name, describe };
  }
  try {
    await estateApi.patch(`/faculties/${id}`, params, {
      headers: {
        Authorization: `Bearer ${originalToken}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const signout = (dispatch) => async () => {
  await Cookies.remove("auth");
  await Cookies.remove("role");
  await Cookies.remove("name");
  dispatch({ type: "signout" });
};

export const { Provider, Context } = createDataContext(
  authReducer,
  {
    signin,
    signout,
    tryLocalSignin,
    deleteUser,
    addEstate,
    updateEstate,
    deleteEstate,
    addCategory,
    deleteCategory,
    updateCategory,
    updateFaculty,
  },
  { token: "" }
);
