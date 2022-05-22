import {useLocation} from "../pkg/react-router-dom.js";
export function useSearchParams() {
  return new URLSearchParams(useLocation().search);
}
