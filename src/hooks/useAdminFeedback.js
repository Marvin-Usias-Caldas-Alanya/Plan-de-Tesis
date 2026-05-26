import { useCallback, useState } from 'react';

export function useAdminFeedback() {
  const [feedback, setFeedback] = useState(null);

  const onFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return { feedback, onFeedback, clearFeedback };
}
