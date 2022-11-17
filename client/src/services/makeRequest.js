import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});
export function makeRequest(url, options) {
  return api(url, options)
    .then((res) => {
      console.log("response from server: ", res.data);
      return res.data;
    })
    .catch((error) =>
      Promise.reject(error?.response?.data?.message ?? "Error")
    );
}
