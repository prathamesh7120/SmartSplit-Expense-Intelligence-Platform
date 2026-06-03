import api from './axiosConfig';

export const createGroup = async (name, description) => {
  const response = await api.post('/groups', { name, description });
  return response.data;
};

export const getMyGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const addMember = async (groupId, email) => {
  const response = await api.post(
    `/groups/${groupId}/members?email=${email}`
  );
  return response.data;
};