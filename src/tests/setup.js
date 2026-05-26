import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom no implementa scrollIntoView (usado en ChatWindow)
Element.prototype.scrollIntoView = vi.fn();
