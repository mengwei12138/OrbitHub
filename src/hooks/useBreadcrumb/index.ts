import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useBreadcrumbStore, {
  type BreadcrumbOverride,
} from '@/store/modules/breadcrumbStore';

const useBreadcrumb = () => {
  const location = useLocation();
  const { setOverride, clearOverride } = useBreadcrumbStore();

  const setBreadcrumb = useCallback(
    (override: BreadcrumbOverride) => {
      setOverride(location.pathname, override);
    },
    [location.pathname, setOverride],
  );

  const clearBreadcrumb = useCallback(() => {
    clearOverride(location.pathname);
  }, [location.pathname, clearOverride]);

  return { setBreadcrumb, clearBreadcrumb };
};

export type { BreadcrumbOverride };

export default useBreadcrumb;
