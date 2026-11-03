import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { t } = useTranslation()
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`w-full ${sizes[size]} rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5`}>
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
