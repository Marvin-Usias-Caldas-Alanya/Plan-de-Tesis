import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ROUTES } from '../utils/constants';

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <Card elevated className="not-found__card">
        <h1 className="not-found__code">404</h1>
        <h3>Página no encontrada</h3>
        <p>La ruta que buscas no existe en NutriStore.</p>
        <Link to={ROUTES.HOME}>
          <Button>Volver al inicio</Button>
        </Link>
      </Card>
    </div>
  );
}
