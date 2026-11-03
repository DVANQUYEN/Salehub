import { Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title ?? t('common.noData')}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
