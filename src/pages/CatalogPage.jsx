import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatWidget from '../components/chatbot/ChatWidget';
import ProductFilters from '../components/products/ProductFilters';
import ProductList from '../components/products/ProductList';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import {
  buildChatConsultMessage,
  buildPurchaseRequestMessage,
} from '../utils/productFormatters';
import { ROUTES } from '../utils/constants';
import './CatalogPage.css';

export default function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [catalogNotice, setCatalogNotice] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');

  const filterParams = useMemo(
    () => ({
      search: search || undefined,
      categoryId: categoryId || undefined,
    }),
    [search, categoryId],
  );

  const { products, categories, loading, error, refreshProducts } =
    useProducts(filterParams);

  const { addProduct, submitting: cartSubmitting } = useCart();

  useEffect(() => {
    const hint = location.state?.categoryHint;
    if (!hint || !categories.length) return;

    const match = categories.find(
      (cat) =>
        cat.name.toLowerCase() === String(hint).toLowerCase() ||
        cat.slug === hint,
    );
    if (match) setCategoryId(match.id);
  }, [location.state, categories]);

  const showOrderFeedback = useCallback((type, message) => {
    setCatalogNotice({ type, text: message });
  }, []);

  const { createPurchaseOrder, submitting: orderSubmitting } = useOrders({
    mode: 'customer',
    profileId: user?.id,
    autoLoad: false,
    onFeedback: showOrderFeedback,
  });

  const openChatWithMessage = useCallback((message) => {
    setChatPrompt(message);
    setChatOpen(true);
    setCatalogNotice(null);
  }, []);

  const handleConsultChat = useCallback(
    (product) => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN, { state: { from: location } });
        return;
      }
      openChatWithMessage(buildChatConsultMessage(product));
    },
    [isAuthenticated, navigate, location, openChatWithMessage],
  );

  const handleAddToCart = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN, { state: { from: location } });
        return;
      }
      try {
        await addProduct(product, 1);
        showOrderFeedback('success', `${product.name} agregado al carrito.`);
      } catch (err) {
        showOrderFeedback('error', err.message);
      }
    },
    [isAuthenticated, navigate, location, addProduct, showOrderFeedback],
  );

  const handleRequestPurchase = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN, { state: { from: location } });
        return;
      }
      if (product.stock <= 0) {
        setCatalogNotice({ type: 'error', text: 'Producto agotado.' });
        return;
      }

      try {
        await createPurchaseOrder([
          {
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
            name: product.name,
          },
        ]);
        openChatWithMessage(buildPurchaseRequestMessage(product));
      } catch {
        openChatWithMessage(buildPurchaseRequestMessage(product));
      }
    },
    [isAuthenticated, navigate, location, createPurchaseOrder, openChatWithMessage],
  );

  const handleChatPromptConsumed = useCallback(() => {
    setChatPrompt('');
  }, []);

  return (
    <div className="catalog-page">
      <header className="page-header">
        <h1>Catálogo de suplementos</h1>
        <p>
          Explora proteínas, vitaminas y más. Agrega al carrito, consulta con el chatbot o
          solicita compra asistida por un vendedor.
        </p>
      </header>

      <ProductFilters
        search={search}
        categoryId={categoryId}
        categories={categories}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryId}
        onRefresh={refreshProducts}
        loading={loading}
      />

      {catalogNotice && (
        <ErrorMessage
          type={catalogNotice.type}
          message={catalogNotice.text}
          className="catalog-page__notice"
        />
      )}

      <ProductList
        products={products}
        loading={loading || orderSubmitting || cartSubmitting}
        error={error}
        onConsultChat={handleConsultChat}
        onAddToCart={handleAddToCart}
        onRequestPurchase={handleRequestPurchase}
      />

      <ChatWidget
        open={chatOpen}
        onOpenChange={setChatOpen}
        initialPrompt={chatPrompt}
        onPromptConsumed={handleChatPromptConsumed}
      />
    </div>
  );
}
