import type { FC, PropsWithChildren, ReactNode } from 'react';

import useAccess from '@/hooks/useAccess';

type AccessProps = PropsWithChildren<{
  path: string;
  fallback?: ReactNode;
}>;

const Access: FC<AccessProps> = ({ path, children, fallback = null }) => {
  const hasAccess = useAccess(path);
  return hasAccess ? children : fallback;
};

export default Access;
