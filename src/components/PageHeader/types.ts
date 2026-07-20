import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
}
