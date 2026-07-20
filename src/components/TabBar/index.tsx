import type { FC } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import type { TabBarProps } from './types';

const TabBar: FC<TabBarProps> = ({ tabs, activeTab, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
    if (activeIndex === -1) return;

    const activeTabElement = tabRefs.current[activeIndex];
    const containerElement = containerRef.current;
    if (!activeTabElement || !containerElement) return;

    const containerRect = containerElement.getBoundingClientRect();
    const tabRect = activeTabElement.getBoundingClientRect();

    setIndicatorStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [tabs, activeTab]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleClick = useCallback(
    (key: string) => {
      if (key !== activeTab) {
        onChange(key);
      }
    },
    [activeTab, onChange],
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        return (
          <div
            key={tab.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : styles.tabItemInactive}`}
            onClick={() => handleClick(tab.key)}
            role="tab"
            aria-selected={isActive}
          >
            {tab.name}
          </div>
        );
      })}
      <div className={styles.indicator} style={indicatorStyle} />
      <div className={styles.borderBottom} />
    </div>
  );
};

export default TabBar;
