const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildResult(errors) {
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(trim(email));
}

export function isValidPassword(password, minLength = MIN_PASSWORD_LENGTH) {
  return typeof password === 'string' && password.length >= minLength;
}

export function isValidName(name, minLength = MIN_NAME_LENGTH) {
  return trim(name).length >= minLength;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailValue = trim(email);

  if (!emailValue) {
    errors.email = 'El correo es obligatorio';
  } else if (!isValidEmail(emailValue)) {
    errors.email = 'Ingresa un correo electrónico válido';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (!isValidPassword(password)) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }

  return buildResult(errors);
}

export function validateRegisterForm({ fullName, email, password, confirmPassword }) {
  const errors = {};
  const emailValue = trim(email);

  if (!isValidName(fullName)) {
    errors.fullName = `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
  }

  if (!emailValue) {
    errors.email = 'El correo es obligatorio';
  } else if (!isValidEmail(emailValue)) {
    errors.email = 'Ingresa un correo electrónico válido';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (!isValidPassword(password)) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return buildResult(errors);
}

export function validateProductForm({ name, price, stock, category_id }) {
  const errors = {};

  if (!trim(name)) {
    errors.name = 'El nombre es obligatorio';
  }

  const priceNum = Number(price);
  if (price === '' || price === null || price === undefined || Number.isNaN(priceNum)) {
    errors.price = 'El precio es obligatorio';
  } else if (priceNum <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  const stockNum = Number(stock);
  if (stock === '' || stock === null || stock === undefined || Number.isNaN(stockNum)) {
    errors.stock = 'El stock es obligatorio';
  } else if (stockNum < 0) {
    errors.stock = 'El stock debe ser mayor o igual a 0';
  }

  if (!category_id) {
    errors.category_id = 'La categoría es obligatoria';
  }

  return buildResult(errors);
}

export function validatePriceStockUpdate({ price, stock }) {
  const errors = {};
  const priceNum = Number(price);
  const stockNum = Number(stock);

  if (Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }
  if (Number.isNaN(stockNum) || stockNum < 0) {
    errors.stock = 'El stock debe ser mayor o igual a 0';
  }

  return buildResult(errors);
}
