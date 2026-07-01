import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { ROLES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CatalogPage from '../pages/CatalogPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import ProfilePage from '../pages/ProfilePage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import SellerDashboardPage from '../pages/SellerDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import MockupsPage from '../pages/MockupsPage';

/**
 * Rutas anidadas bajo Layout (React Router v6+).
 * Rutas hijas sin barra inicial: relativas al layout padre path="/".
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="mockups" element={<MockupsPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="catalogo" element={<CatalogPage />} />

          <Route
            path="carrito"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN]}>
                  <CartPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN]}>
                  <CheckoutPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="mis-pedidos"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN]}>
                  <OrdersPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboardPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="vendedor"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.SELLER, ROLES.ADMIN]}>
                  <SellerDashboardPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
