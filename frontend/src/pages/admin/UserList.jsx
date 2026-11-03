import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getUsers, updateUser, deleteUser } from '../../services/userService'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import IconButton from '../../components/common/IconButton'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/forms/SearchInput'
import Pagination from '../../components/forms/Pagination'
import { USER_ROLES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { Edit, Trash2, UserX, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_KEYS = Object.keys(USER_ROLES)

const getRoleVariant = (role) => {
  switch (role) {
    case 'ADMIN': return 'danger'
    case 'SALES': return 'info'
    case 'CUSTOMER': return 'success'
    default: return 'default'
  }
}

export default function UserList() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    loadUsers()
  }, [search, role, page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers({ search, role, page, limit: 10 })
      setUsers(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.usersLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    reset({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    })
  }

  const closeEditModal = () => {
    setEditingUser(null)
    reset({})
  }

  const onSubmit = async (data) => {
    try {
      await updateUser(editingUser.id, data)
      toast.success(t('messages.userUpdated'))
      closeEditModal()
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.userUpdateFailed'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('users.deleteConfirm'))) return
    try {
      await deleteUser(id)
      toast.success(t('messages.userDeleted'))
      loadUsers()
    } catch (error) {
      toast.error(t('messages.userDeleteFailed'))
    }
  }

  const handleToggleActive = async (user) => {
    const newStatus = !user.isActive
    try {
      await updateUser(user.id, { isActive: newStatus })
      toast.success(newStatus ? t('messages.userActivated') : t('messages.userDeactivated'))
      loadUsers()
    } catch (error) {
      toast.error(t('messages.userStatusFailed'))
    }
  }

  const columns = [
    { header: t('auth.fullName'), render: (row) => row.fullName || '-' },
    { header: t('common.email'), render: (row) => row.email || '-' },
    {
      header: t('users.role'),
      render: (row) => (
        <Badge variant={getRoleVariant(row.role)}>
          {enumLabel(t, 'users.roles', row.role)}
        </Badge>
      ),
    },
    {
      header: t('common.status'),
      render: (row) => (
        <Badge variant={row.isActive !== false ? 'success' : 'danger'}>
          {row.isActive !== false ? t('users.active') : t('users.inactive')}
        </Badge>
      ),
    },
    { header: t('common.createdAt'), render: (row) => formatDate(row.createdAt) },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon={Edit}
            label={t('common.edit')}
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(row)
            }}
          />
          <IconButton
            icon={row.isActive !== false ? UserX : UserCheck}
            label={row.isActive !== false ? t('users.deactivate') : t('users.activate')}
            variant={row.isActive !== false ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(row)
            }}
          />
          <IconButton
            icon={Trash2}
            label={t('common.delete')}
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row.id)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('users.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('users.searchPlaceholder')}
        />
        <select
          aria-label={t('users.filterByRole')}
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('users.allRoles')}</option>
          {ROLE_KEYS.map((r) => (
            <option key={r} value={r}>
              {enumLabel(t, 'users.roles', r)}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={closeEditModal}
        title={t('users.editUser')}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('auth.fullName')}
            {...register('fullName', { required: t('validation.required', { field: t('auth.fullName') }) })}
            error={errors.fullName?.message}
          />
          <Input
            label={t('common.email')}
            type="email"
            {...register('email', {
              required: t('validation.required', { field: t('common.email') }),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.emailInvalid'),
              },
            })}
            error={errors.email?.message}
          />
          <Select
            label={t('users.role')}
            {...register('role', { required: t('validation.required', { field: t('users.role') }) })}
            error={errors.role?.message}
          >
            {ROLE_KEYS.map((r) => (
              <option key={r} value={r}>
                {enumLabel(t, 'users.roles', r)}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeEditModal}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
