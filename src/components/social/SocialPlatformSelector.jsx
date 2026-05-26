const PLATFORM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

export default function SocialPlatformSelector({
  platforms = [],
  value,
  onChange,
  required = false,
  id = 'platform_id',
  label = 'Plataforma',
}) {
  return (
    <label htmlFor={id}>
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Seleccionar plataforma…</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>
            {PLATFORM_LABELS[p.code] ?? p.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SocialPlatformCodeSelector({
  platforms = [],
  value,
  onChange,
  required = false,
  id = 'platform_code',
}) {
  return (
    <label htmlFor={id}>
      Plataforma
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Seleccionar…</option>
        {platforms.map((p) => (
          <option key={p.code} value={p.code}>
            {PLATFORM_LABELS[p.code] ?? p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
