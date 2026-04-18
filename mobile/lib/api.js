import axios from "axios";

export const API = axios.create({
  baseURL: "http://192.168.137.83:5000/api", // ← your IP here
});