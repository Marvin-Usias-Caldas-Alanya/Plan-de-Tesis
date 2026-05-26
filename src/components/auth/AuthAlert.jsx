import ErrorMessage from '../common/ErrorMessage';

export default function AuthAlert({ type = 'error', message }) {
  return <ErrorMessage type={type} message={message} />;
}
