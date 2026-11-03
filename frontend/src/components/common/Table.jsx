import Loading from './Loading'
import EmptyState from './EmptyState'

export default function Table({ columns, data = [], loading = false, onRowClick }) {
  if (loading) {
    return <Loading />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6">
                <EmptyState />
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                onKeyDown={(e) => {
                  if (onRowClick && e.target === e.currentTarget && e.key === 'Enter') onRowClick(row)
                }}
                tabIndex={onRowClick ? 0 : undefined}
                className={`transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-primary-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
