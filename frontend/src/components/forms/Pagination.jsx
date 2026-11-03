import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const navButtonClass =
  'inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50'

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <nav aria-label={t('common.pagination')} className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t('common.previousPage')}
        className={navButtonClass}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('common.previous')}</span>
      </button>

      <div className="flex items-center gap-1">
        {getPages().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={t('common.pageN', { page })}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              page === currentPage
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={t('common.nextPage')}
        className={navButtonClass}
      >
        <span className="hidden sm:inline">{t('common.next')}</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
