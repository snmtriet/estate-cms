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

const addEstate =
  (dispatch) =>
  async ({ name }) => {
    console.log(name);
    name = name.trim();
    try {
      const response = await estateApi.post("/estates", {
        name,
      });
      console.log(response.data.data.estate);
    } catch (error) {
      console.log(error);
    }
  };

const deleteEstate = (dispatch) => async (listEstate) => {
  try {
    const token = await Cookies.get("auth");
    const bytes = await cryptoJs.AES.decrypt(token, "secret token");
    const originalToken = await bytes.toString(cryptoJs.enc.Utf8);
    listEstate.map(async (id) => {
      const response = await estateApi.delete(`/estates/${id}`, {
        headers: {
          Authorization: `Bearer ${originalToken}`,
        },
      });
      console.log(response.status);
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
      dispatch({ type: "signin", payload: token });
    } catch (err) {
      dispatch({ type: "add_error", payload: err.response.data.message });
    }
  };

const signout = (dispatch) => async () => {
  await Cookies.remove("auth");
  await Cookies.remove("role");
  dispatch({ type: "signout" });
};

export const { Provider, Context } = createDataContext(
  authReducer,
  {
    signin,
    signout,
    tryLocalSignin,
    addEstate,
    deleteEstate,
  },
  { token: "" }
);
