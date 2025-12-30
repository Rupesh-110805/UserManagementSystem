import api from './api';

export const userService = {
  getAllUsers: async (page = 1) => {
    const { data } = await api.get(`/users/?page=${page}`);
    return data;
  },

  getUserById: async (userId) => {
    const { data } = await api.get(`/users/${userId}/`);
    return data;
  },

  activateUser: async (userId) => {
    const { data } = await api.post(`/users/${userId}/activate/`);
    return data;
  },

  deactivateUser: async (userId) => {
    const { data } = await api.post(`/users/${userId}/deactivate/`);
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/update_profile/', profileData);
    return data;
  },

  changePassword: async (passwordData) => {
    const { data } = await api.post('/users/change_password/', passwordData);
    return data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const { data } = await api.post('/users/upload_profile_picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteProfilePicture: async () => {
    const { data } = await api.delete('/users/delete_profile_picture/');
    return data;
  },
};
