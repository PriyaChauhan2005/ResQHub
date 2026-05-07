// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// const getAuthToken = () => {
//   const token = localStorage.getItem("token");
//   if (token) return token;

//   const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
//   return currentUser?.token || null;
// };

// export const apiRequest = async (path, options = {}) => {
//   const token = getAuthToken();
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };

//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers,
//   });

//   const payload = await response.json().catch(() => ({}));
//   if (!response.ok) {
//     throw new Error(payload?.message || "Request failed");
//   }

//   return payload;
// };

// export { API_BASE_URL };

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  return currentUser?.token || null;
};

export const apiRequest = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
};

export { API_BASE_URL };