import { APP_NAME } from '../../utils/constants';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">
          © {year} {APP_NAME}
        </p>
        <p className="footer__academic">
          Sistema desarrollado como parte de un proyecto de tesis de Ingeniería de
          Sistemas e Informática.
        </p>
      </div>
    </footer>
  );
}
