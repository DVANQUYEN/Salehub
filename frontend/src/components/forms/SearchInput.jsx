import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SearchInput({ value, onChange, placeholder }) {
  const { t } = useTranslation()
  const label = placeholder ?? t('common.searchPlaceholder')
  const [inputValue, setInputValue] = useState(value || '')

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [inputValue, onChange, value])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={label}
        aria-label={label}
        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  )
}
