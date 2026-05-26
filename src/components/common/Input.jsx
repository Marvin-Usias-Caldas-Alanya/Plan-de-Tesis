import './Input.css';

export default function Input({
  id,
  label,
  type = 'text',
  as = 'input',
  value,
  onChange,
  error,
  hint,
  autoComplete,
  required = false,
  placeholder,
  options = [],
  className = '',
  ...props
}) {
  const fieldId = id || props.name;
  const invalid = Boolean(error);

  const controlProps = {
    id: fieldId,
    value,
    onChange,
    required,
    placeholder,
    autoComplete,
    'aria-invalid': invalid,
    'aria-describedby': error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined,
    className: `ui-input__control${invalid ? ' ui-input__control--invalid' : ''}`,
    ...props,
  };

  return (
    <div className={`ui-input ${className}`.trim()}>
      {label && (
        <label className="ui-input__label" htmlFor={fieldId}>
          {label}
        </label>
      )}

      {as === 'select' ? (
        <select {...controlProps}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} {...controlProps} />
      )}

      {hint && !error && (
        <p id={`${fieldId}-hint`} className="ui-input__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="ui-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
