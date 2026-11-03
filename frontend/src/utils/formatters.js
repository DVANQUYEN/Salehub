import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '-'
  return format(parseISO(date), 'dd/MM/yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return format(parseISO(date), 'dd/MM/yyyy HH:mm')
}

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export const formatNumber = (num) => {
  if (!num && num !== 0) return '-'
  return new Intl.NumberFormat('vi-VN').format(num)
}
