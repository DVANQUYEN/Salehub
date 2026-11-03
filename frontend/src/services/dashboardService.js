import api from './api'

export const getOverview = () => api.get('/dashboard/overview')
export const getSalesMetrics = () => api.get('/dashboard/sales-metrics')
export const getPipelineReport = () => api.get('/dashboard/pipeline')
export const getCustomerReport = () => api.get('/dashboard/customers')
export const getPerformanceReport = () => api.get('/dashboard/performance')
