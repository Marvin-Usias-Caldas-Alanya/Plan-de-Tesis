export function formatProductPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price ?? 0);
}

export function buildChatConsultMessage(product) {
  return `Hola, me interesa el producto "${product.name}"${product.sku ? ` (${product.sku})` : ''}. ¿Puedes darme más información?`;
}

export function buildPurchaseRequestMessage(product) {
  return `Quiero solicitar la compra de "${product.name}"${product.sku ? ` - SKU: ${product.sku}` : ''}. Precio: ${formatProductPrice(product.price)}.`;
}
