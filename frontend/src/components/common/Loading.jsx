import { useTranslation } from 'react-i18next'

export default function Loading({ fullScreen = false }) {
  const { t } = useTranslation()
  const spinner = (
    <div
      role="status"
      className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600"
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
