import axios from "axios";
import { logoutUser } from "../utils/logoutHandler"; // We'll create this

const api = axios.create({
  baseURL: "/api/v1", // Use relative path to match Vite proxy
  withCredentials: true, // Enables cookie-based auth
});
console.log("Frontend API Base URL:", api.defaults.baseURL);

// Auto-logout if session expired or invalid
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await logoutUser(); // call logout
    }
    return Promise.reject(error);
  }
);

export default api;
