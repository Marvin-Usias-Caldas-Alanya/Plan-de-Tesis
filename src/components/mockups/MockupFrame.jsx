import { useRef, useState } from 'react';
import Button from '../common/Button';
import { captureMockupAsPng } from './captureMockup';

/**
 * Marco visual tipo Figma / captura de pantalla.
 * Envuelve el diseño en chrome de navegador (desktop) o dispositivo (mobile).
 */
export default function MockupFrame({
  variant = 'desktop',
  url = 'nutristore.app',
  fileName = 'mockup.png',
  children,
}) {
  const frameRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  async function handleDownload() {
    if (!frameRef.current) return;
    setCapturing(true);
    try {
      await captureMockupAsPng(frameRef.current, fileName);
    } finally {
      setCapturing(false);
    }
  }

  const frameClass =
    variant === 'mobile'
      ? 'mockup-frame mockup-frame--mobile'
      : 'mockup-frame mockup-frame--desktop';

  return (
    <div className="mockup-frame-wrap">
      <div className="mockup-frame-toolbar">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={capturing}
          onClick={handleDownload}
        >
          {capturing ? 'Capturando…' : 'Descargar PNG'}
        </Button>
      </div>

      {variant === 'mobile' ? (
        <div ref={frameRef} className={frameClass} data-capture-root>
          <div className="mockup-frame__device">
            <div className="mockup-frame__device-bar">
              <span>9:41</span>
              <span className="mockup-frame__device-notch" />
              <span>LTE ▰▰▰</span>
            </div>
            <div className="mockup-frame__screen mockup-frame__screen--mobile">
              <div className="mockup-visual">{children}</div>
            </div>
            <div className="mockup-frame__device-home" />
          </div>
        </div>
      ) : (
        <div ref={frameRef} className={frameClass} data-capture-root>
          <div className="mockup-frame__chrome">
            <div className="mockup-frame__dots">
              <span />
              <span />
              <span />
            </div>
            <div className="mockup-frame__url-bar">{url}</div>
            <div className="mockup-frame__chrome-spacer" />
          </div>
          <div className="mockup-frame__screen mockup-frame__screen--desktop">
            <div className="mockup-visual">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
