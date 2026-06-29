import { useNavigate, useLocation, useParams as useRouterParams, useSearchParams as useReactSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
    pathname: location.pathname,
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useParams() {
  return useRouterParams();
}

export function useSearchParams() {
  const [searchParams] = useReactSearchParams();
  return searchParams;
}

export function redirect(url: string) {
  window.location.href = url;
}
