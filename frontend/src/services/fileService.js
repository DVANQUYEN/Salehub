import api from './api'

export const getFiles = (params) => api.get('/files', { params })
export const getFile = (id) => api.get(`/files/${id}`)
export const uploadFile = (formData, config = {}) => api.post('/files/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  ...config,
})
export const deleteFile = (id) => api.delete(`/files/${id}`)
export const downloadFile = (id) => api.get(`/files/${id}/download`, { responseType: 'blob' })
