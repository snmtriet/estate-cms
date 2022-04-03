import axios from "axios";

export default axios.create({
  baseURL: "http://192.168.10.28:4000/api",
});
