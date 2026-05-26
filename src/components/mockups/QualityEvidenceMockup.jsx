import MockupFrame from './MockupFrame';
import { MockBadge, MockBtn, MockStat } from './mockupUi';
import { MOCK_QUALITY_METRICS } from './mockupData';

export default function QualityEvidenceMockup() {
  return (
    <MockupFrame url="nutristore.app/evidencias" fileName="mockup-quality-evidence.png">
      <div className="mock-ui mock-ui--quality">
        <div className="mock-ui__quality-head">
          <div className="mock-ui__logo">
            <span className="mock-ui__logo-mark">📊</span>
            Evidencia de calidad · Tesis
          </div>
          <MockBadge tone="ok">NutriStore</MockBadge>
        </div>
        <h3 className="mock-ui__title">Pruebas, código limpio y despliegue</h3>
        <p className="mock-ui__subtitle">
          Resumen visual de métricas para la memoria de tesis
        </p>
        <div className="mock-ui__grid mock-ui__grid--2">
          {MOCK_QUALITY_METRICS.map((m) => (
            <MockStat key={m.label} label={m.label} value={m.value} trend="Cumple umbral" />
          ))}
        </div>
        <div className="mock-ui__panel">
          <strong className="mock-ui__panel-title">Documentación relacionada</strong>
          <ul className="mock-ui__list">
            <li>docs/REPORTE_PRUEBAS.md</li>
            <li>docs/CODIGO_LIMPIO.md</li>
            <li>docs/SONAR_ANALISIS.md</li>
            <li>docs/EVIDENCIAS_CALIDAD_DESPLIEGUE.md</li>
          </ul>
        </div>
        <div className="mock-ui__hero-actions">
          <MockBtn>npm run quality</MockBtn>
          <MockBtn variant="secondary">npm run sonar</MockBtn>
        </div>
      </div>
    </MockupFrame>
  );
}
