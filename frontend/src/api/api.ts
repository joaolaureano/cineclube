import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api/v1";

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    //token provisorio montado pelo AuthContext; sem assinatura, sem refresh
    const token = localStorage.getItem("token");
    if (token) config.headers.authorization = token;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
