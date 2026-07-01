import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
