import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { createCoupon, createPromotion, getCoupons, getPromotions } from '../../services/paymentService';
import './AdminShared.css';

export default function AdminPromotionsPanel({ onFeedback }) {
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoForm, setPromoForm] = useState({
    name: '',
    discount_type: 'percentage',
    discount_value: 10,
  });
  const [couponCode, setCouponCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getPromotions(), getCoupons()]);
      setPromotions(p);
      setCoupons(c);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePromo = async (e) => {
    e.preventDefault();
    try {
      await createPromotion({ ...promoForm, is_active: true });
      onFeedback?.('success', 'Promoción creada');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  const handleCoupon = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({ code: couponCode, is_active: true });
      onFeedback?.('success', 'Cupón creado');
      setCouponCode('');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  if (loading) return <Loading label="Cargando promociones…" />;

  return (
    <div className="admin-panel-section">
      <Card elevated>
        <form className="admin-form-grid" onSubmit={handlePromo}>
          <h2 className="page-section__title">Nueva promoción</h2>
          <label>
            Nombre
            <input
              value={promoForm.name}
              onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
              required
            />
          </label>
          <Button type="submit">Crear promoción</Button>
        </form>
      </Card>
      <Card elevated>
        <form className="admin-form-grid" onSubmit={handleCoupon}>
          <h2 className="page-section__title">Nuevo cupón</h2>
          <label>
            Código
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
          </label>
          <Button type="submit">Crear cupón</Button>
        </form>
      </Card>
      <Card elevated padding={false}>
        {!promotions.length && !coupons.length ? (
          <AdminEmptyState />
        ) : (
          <>
            <h3 style={{ padding: '1rem' }}>Promociones ({promotions.length})</h3>
            <h3 style={{ padding: '1rem' }}>Cupones ({coupons.length})</h3>
          </>
        )}
      </Card>
    </div>
  );
}
