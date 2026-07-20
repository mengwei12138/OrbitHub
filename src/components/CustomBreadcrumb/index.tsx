import { Breadcrumb } from 'antd';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumbItems } from '@/hooks';
import { useBreadcrumbStore } from '@/store';

import styles from './style.module.css';

type CustomBreadcrumbProps = {
  toolBar?: React.ReactNode;
};

const CustomBreadcrumb: FC<CustomBreadcrumbProps> = ({ toolBar }) => {
  const location = useLocation();
  const breadcrumbItems = useBreadcrumbItems();
  const override = useBreadcrumbStore((s) => s.overrides[location.pathname]);

  const items = override?.items ?? breadcrumbItems;
  const displayToolBar = override?.toolBar ?? toolBar;
  const separator = override?.props?.separator ?? (
    <span className={styles.separator}>/</span>
  );

  const mappedItems = useMemo(
    () =>
      items.map((item, index) => ({
        title: (
          <span
            className={
              index === items.length - 1 ? styles.current : styles.parent
            }
          >
            {item.name}
          </span>
        ),
      })),
    [items],
  );

  if (items.length < 2) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Breadcrumb items={mappedItems} separator={separator} />
      {displayToolBar && <div className={styles.toolBar}>{displayToolBar}</div>}
    </div>
  );
};

export default CustomBreadcrumb;
