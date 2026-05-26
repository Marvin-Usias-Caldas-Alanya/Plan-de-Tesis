import Input from '../common/Input';
import Button from '../common/Button';
import './ProductFilters.css';

export default function ProductFilters({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
  onRefresh,
  loading = false,
}) {
  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="product-filters">
      <Input
        type="search"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Buscar producto por nombre"
      />
      <Input
        as="select"
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categoryOptions}
        aria-label="Filtrar por categoría"
      />
      {onRefresh && (
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          className="product-filters__refresh"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      )}
    </div>
  );
}
