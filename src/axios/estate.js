import axios from "axios";

export default axios.create({
  baseURL: "https://estate-server-api.herokuapp.com/api",
});
