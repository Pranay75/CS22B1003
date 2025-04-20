import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

const BASE_URL = 'http://20.244.56.144/evaluation-service';


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.token}`
  }
});

export default apiClient;
