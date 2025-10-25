import axios from 'axios';
const instance = axios.create({ baseURL: 'http://localhost:80' });
instance.defaults.headers.common['Content-Type'] = 'multipart/form-data';
export default instance;
