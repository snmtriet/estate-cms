import axios from "axios";

export default axios.create({
  baseURL: "http://172.16.8.178:4000/api",
});
