import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import AuthLayout from '../components/layout/AuthLayout'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import Dashboard from '../pages/dashboard/Dashboard'
import ProductList from '../pages/products/ProductList'
import ProductForm from '../pages/products/ProductForm'
import ProductDetail from '../pages/products/ProductDetail'
import CustomerList from '../pages/customers/CustomerList'
import CustomerForm from '../pages/customers/CustomerForm'
import CustomerDetail from '../pages/customers/CustomerDetail'
import DealList from '../pages/deals/DealList'
import DealKanban from '../pages/deals/DealKanban'
import DealForm from '../pages/deals/DealForm'
import DealDetail from '../pages/deals/DealDetail'
import QuoteList from '../pages/quotes/QuoteList'
import QuoteForm from '../pages/quotes/QuoteForm'
import QuoteDetail from '../pages/quotes/QuoteDetail'
import FileList from '../pages/files/FileList'
import UserList from '../pages/admin/UserList'
import Profile from '../pages/profile/Profile'
import Loading from '../components/common/Loading'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading fullScreen />
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={
          <ProtectedRoute roles={['ADMIN']}><ProductForm /></ProtectedRoute>
        } />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute roles={['ADMIN']}><ProductForm /></ProtectedRoute>
        } />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/deals" element={<DealList />} />
        <Route path="/deals/kanban" element={<DealKanban />} />
        <Route path="/deals/new" element={<DealForm />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/deals/:id/edit" element={<DealForm />} />
        <Route path="/quotes" element={<QuoteList />} />
        <Route path="/quotes/new" element={<QuoteForm />} />
        <Route path="/quotes/:id" element={<QuoteDetail />} />
        <Route path="/quotes/:id/edit" element={<QuoteForm />} />
        <Route path="/files" element={<FileList />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin only */}
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN']}><UserList /></ProtectedRoute>
        } />
      </Route>

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
