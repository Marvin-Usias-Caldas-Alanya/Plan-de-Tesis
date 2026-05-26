import { useCallback, useMemo, useState } from 'react';
import ChatWidget from '../components/chatbot/ChatWidget';
import ProductFilters from '../components/products/ProductFilters';
import ProductList from '../components/products/ProductList';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import {
  buildChatConsultMessage,
  buildPurchaseRequestMessage,
} from '../utils/productFormatters';
import './CatalogPage.css';

export default function CatalogPage() {
  const { user } = useAuth();
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

  const showOrderFeedback = useCallback((type, message) => {
    setCatalogNotice({ type, text: message });
  }, []);

  const { createPurchaseOrder, submitting: orderSubmitting } = useOrders({
    mode: 'customer',
    profileId: user?.id,
    onFeedback: showOrderFeedback,
  });

  const openChatWithMessage = useCallback((message) => {
    setChatPrompt(message);
    setChatOpen(true);
    setCatalogNotice(null);
  }, []);

  const handleConsultChat = useCallback(
    (product) => {
      openChatWithMessage(buildChatConsultMessage(product));
    },
    [openChatWithMessage],
  );

  const handleRequestPurchase = useCallback(
    async (product) => {
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
    [createPurchaseOrder, openChatWithMessage],
  );

  const handleChatPromptConsumed = useCallback(() => {
    setChatPrompt('');
  }, []);

  return (
    <div className="catalog-page">
      <header className="page-header">
        <h1>Catálogo de suplementos</h1>
        <p>
          Explora proteínas, vitaminas y más. Consulta con el chatbot o solicita tu compra
          directamente desde cada producto.
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
        loading={loading || orderSubmitting}
        error={error}
        onConsultChat={handleConsultChat}
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
