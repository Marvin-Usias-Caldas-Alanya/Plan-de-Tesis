import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../../components/products/ProductCard';
import { SAMPLE_PRODUCT } from '../helpers/mockData';

describe('ProductCard', () => {
  it('muestra datos del producto', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);
    expect(screen.getByRole('heading', { name: SAMPLE_PRODUCT.name })).toBeInTheDocument();
    expect(screen.getByText(/\$899/)).toBeInTheDocument();
    expect(screen.getByText(/10 en stock/i)).toBeInTheDocument();
    expect(screen.getByText('Proteínas')).toBeInTheDocument();
  });

  it('muestra stock bajo', () => {
    render(<ProductCard product={{ ...SAMPLE_PRODUCT, stock: 3 }} />);
    expect(screen.getByText('Stock bajo')).toBeInTheDocument();
    expect(screen.getByText(/3 en stock/i)).toBeInTheDocument();
  });

  it('muestra agotado', () => {
    render(<ProductCard product={{ ...SAMPLE_PRODUCT, stock: 0 }} />);
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.getByText('Sin unidades')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar compra/i })).toBeDisabled();
  });

  it('ejecuta callback al consultar por chatbot', async () => {
    const user = userEvent.setup();
    const onConsult = vi.fn();
    render(<ProductCard product={SAMPLE_PRODUCT} onConsultChat={onConsult} />);
    await user.click(screen.getByRole('button', { name: /consultar por chatbot/i }));
    expect(onConsult).toHaveBeenCalledWith(SAMPLE_PRODUCT);
  });
});
