import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseURL = isLocal ? "http://localhost:4000/api" : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
