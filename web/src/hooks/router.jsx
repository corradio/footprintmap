import { useLocation } from 'react-router-dom';

export function useSearchParams() {
  return new URLSearchParams(useLocation().search);
}
