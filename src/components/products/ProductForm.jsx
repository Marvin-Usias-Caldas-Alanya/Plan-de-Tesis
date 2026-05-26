import { useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateProductForm } from '../../utils/validators';
import './ProductForm.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  sku: '',
  is_active: true,
};

export default function ProductForm({
  mode = 'create',
  initialData = null,
  categories = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        price: String(initialData.price ?? ''),
        stock: String(initialData.stock ?? ''),
        category_id: initialData.category_id ?? '',
        sku: initialData.sku ?? '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [mode, initialData]);

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateProductForm(form);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    onSubmit?.({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id,
      sku: form.sku.trim() || null,
      is_active: form.is_active,
    });
  };

  const categoryOptions = [
    { value: '', label: 'Selecciona una categoría' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Card elevated className="product-form">
      <h2 className="product-form__title">
        {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
      </h2>

      <form className="product-form__grid" onSubmit={handleSubmit} noValidate>
        <Input
          id="product-name"
          label="Nombre *"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
        />

        <Input
          id="product-sku"
          label="SKU"
          value={form.sku}
          onChange={handleChange('sku')}
          placeholder="Opcional"
          required={false}
        />

        <div className="product-form__full">
          <Input
            id="product-description"
            label="Descripción"
            value={form.description}
            onChange={handleChange('description')}
            required={false}
          />
        </div>

        <Input
          id="product-price"
          label="Precio (MXN) *"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange('price')}
          error={errors.price}
        />

        <Input
          id="product-stock"
          label="Stock *"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange('stock')}
          error={errors.stock}
        />

        <Input
          as="select"
          id="product-category"
          label="Categoría *"
          value={form.category_id}
          onChange={handleChange('category_id')}
          options={categoryOptions}
          error={errors.category_id}
        />

        <div className="product-form__checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange('is_active')}
            />
            Producto activo en catálogo
          </label>
        </div>

        <div className="product-form__actions product-form__full">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear producto'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
