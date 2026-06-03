import api from './axiosConfig';

// Every function here = one backend endpoint.
// Components call these functions — they never write
// axios directly. If your URL changes, you fix it here
// in one place, not in 10 components.

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};