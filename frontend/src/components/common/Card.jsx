export default function Card({ children, title, actions, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
