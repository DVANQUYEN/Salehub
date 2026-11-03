const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
}

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

// Decorative initials avatar. The user's name is always shown next to it.
export default function Avatar({ name, size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-semibold text-white ring-2 ring-white ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}
