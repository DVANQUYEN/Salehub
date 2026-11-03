import { forwardRef, useId } from 'react'

const Select = forwardRef(function Select({
  label,
  error,
  children,
  className = '',
  id,
  ...rest
}, ref) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
        }`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

export default Select
