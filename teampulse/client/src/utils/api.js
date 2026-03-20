import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teampulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('teampulse_token');
      localStorage.removeItem('teampulse_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;




// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
//   headers: { 'Content-Type': 'application/json' },
// });

// // Attach JWT token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('teampulse_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401 globally
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response && err.response.status === 401) {
//       console.log("Unauthorized - maybe redirect to login");
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;