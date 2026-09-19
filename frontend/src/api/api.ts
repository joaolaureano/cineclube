import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api/v1";

const api = axios.create({
  baseURL: apiUrl,
  //a sessao e um cookie httpOnly: o navegador o envia sozinho, e o JavaScript
  //nao tem como le-lo para montar um header. SPA e API saem do mesmo dominio
  //no CloudFront, entao isto nao depende de CORS.
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    //sessao expirada ou invalida: o perfil em cache mentiria sobre estar
    //logado, entao ele sai e a interface volta para o login
    if (error?.response?.status === 401) {
      localStorage.removeItem("stubUser");
    }
    return Promise.reject(error);
  }
);

export default api;
