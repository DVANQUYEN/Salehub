const variants = {
  default: 'text-gray-500 hover:text-primary-600 hover:bg-primary-50',
  danger: 'text-gray-500 hover:text-red-600 hover:bg-red-50',
  success: 'text-gray-500 hover:text-green-600 hover:bg-green-50',
  warning: 'text-gray-500 hover:text-orange-600 hover:bg-orange-50',
}

// Icon-only button. `label` is required: it becomes the accessible name,
// and is also shown as a visual tooltip on hover/focus.
export default function IconButton({ icon: Icon, label, onClick, variant = 'default', className = '' }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${variants[variant]} ${className}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
