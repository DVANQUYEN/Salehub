import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getFiles, uploadFile, deleteFile, downloadFile } from '../../services/fileService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/forms/Pagination'
import { Upload, Download, Trash2, File, FileText, Image, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'

const FILE_TYPE_KEYS = ['pdf', 'image', 'spreadsheet', 'document']

export default function FileList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const fileInputRef = useRef(null)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadFiles()
  }, [typeFilter, page])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const res = await getFiles({ type: typeFilter, page, limit: 12 })
      setFiles(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.filesLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file) => {
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t('messages.fileTooLarge'))
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setUploadProgress(0)
      await uploadFile(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(percent)
        },
      })
      toast.success(t('messages.fileUploaded'))
      setPage(1)
      loadFiles()
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.fileUploadFailed'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async (id, originalName) => {
    try {
      const res = await downloadFile(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', originalName || `file-${id}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(t('messages.fileDownloaded'))
    } catch (error) {
      toast.error(t('messages.fileDownloadFailed'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('files.deleteConfirm'))) return
    try {
      await deleteFile(id)
      toast.success(t('messages.fileDeleted'))
      loadFiles()
    } catch (error) {
      toast.error(t('messages.fileDeleteFailed'))
    }
  }

  const getFileIcon = (mimetype) => {
    if (mimetype?.includes('pdf')) return <FileText className="w-10 h-10 text-red-500" />
    if (mimetype?.includes('image')) return <Image className="w-10 h-10 text-green-500" />
    if (mimetype?.includes('spreadsheet') || mimetype?.includes('excel')) return <FileSpreadsheet className="w-10 h-10 text-green-600" />
    return <File className="w-10 h-10 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const getFileTypeKey = (mimetype) => {
    if (mimetype?.includes('pdf')) return 'pdf'
    if (mimetype?.includes('image')) return 'image'
    if (mimetype?.includes('spreadsheet') || mimetype?.includes('excel')) return 'spreadsheet'
    if (mimetype?.includes('word') || mimetype?.includes('document')) return 'document'
    return 'file'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('files.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('files.subtitle')}</p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files[0]) }}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" aria-hidden="true" />
        <p className="text-gray-600 mb-2">{t('files.dragDrop')}</p>
        <p className="text-sm text-gray-400 mb-4">{t('files.fileTypes')}</p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          loading={uploading}
          disabled={uploading}
        >
          {t('files.chooseFile')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
        {uploading && (
          <div className="mt-4">
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('files.uploading')}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          aria-label={t('files.filterByType')}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('files.allTypes')}</option>
          {FILE_TYPE_KEYS.map((type) => (
            <option key={type} value={type}>
              {enumLabel(t, 'files.types', type)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : files.length === 0 ? (
        <EmptyState
          title={t('files.noFiles')}
          description={t('files.noFilesDesc')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id}>
                <div className="flex items-start gap-3">
                  {getFileIcon(file.mimetype)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    <p className="text-sm text-gray-400">{formatDate(file.createdAt)}</p>
                    <div className="mt-1">
                      <Badge variant="default">{enumLabel(t, 'files.types', getFileTypeKey(file.mimetype))}</Badge>
                    </div>
                    {file.uploadedBy && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t('files.uploadedByName', { name: file.uploadedBy.fullName || file.uploadedBy.email })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(file.id, file.originalName)}
                  >
                    <Download className="w-4 h-4 mr-1" aria-hidden="true" /> {t('common.download')}
                  </Button>
                  {isAdmin && (
                    <Button size="sm" variant="danger" onClick={() => handleDelete(file.id)} aria-label={t('common.delete')}>
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
