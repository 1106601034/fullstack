import axios from "axios";
// Imports the axios HTTP client for making API requests.

const instance = axios.create({ baseURL: "http://localhost:8080" });
// Creates a preconfigured axios instance targeting the backend server.

instance.defaults.headers.common["Content-Type"] = "multipart/form-data";
// Sets the default Content-Type header so file uploads send multipart form data.

export default instance;
// Exports the configured axios instance for reuse across the app.
