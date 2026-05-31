import api from './api'

export const userService = {
  getCurrentUser: () => api.get('/users/me'),
  getAllUsers: (page = 0, size = 10) =>
    api.get(`/users?page=${page}&size=${size}`),
  updateProfile: (data) => api.put('/users/me', data),
}
