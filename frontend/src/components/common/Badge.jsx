const variants = {
  success: 'bg-green-50 text-green-700 ring-green-600/20',
  warning: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-primary-50 text-primary-700 ring-primary-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  pink: 'bg-pink-50 text-pink-700 ring-pink-600/20',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  default: 'bg-gray-100 text-gray-700 ring-gray-500/10',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant] || variants.default}`}>
      {children}
    </span>
  )
}
