export default function CampaignSelector({
  campaigns = [],
  value,
  onChange,
  id = 'campaign_id',
  label = 'Campaña (opcional)',
}) {
  return (
    <label htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sin campaña</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.status})
          </option>
        ))}
      </select>
    </label>
  );
}
