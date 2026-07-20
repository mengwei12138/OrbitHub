import cx from 'classnames';
import type { FC } from 'react';
import { Fragment, useCallback } from 'react';
import styles from './style.module.css';
import type { CustomStepsProps, StepItem } from './types';

const CustomSteps: FC<CustomStepsProps> = ({
  current = 0,
  items = [],
  className,
}) => {
  const getStepStatus = useCallback(
    (index: number): 'active' | 'pending' | 'finish' => {
      if (index < current) return 'finish';
      if (index === current) return 'active';
      return 'pending';
    },
    [current],
  );

  return (
    <div className={cx(styles.wrapper, className)}>
      {items.map((item: StepItem, index: number) => {
        const status = getStepStatus(index);
        const stepKey = item.title ?? index;

        return (
          <Fragment key={stepKey}>
            <div className={styles.stepWrapper}>
              <div className={cx(styles.step, styles[status])}>
                <div className={styles.circle}>{index + 1}</div>
                <span className={styles.label}>{item.title}</span>
              </div>
            </div>
            {index < items.length - 1 && <div className={styles.connector} />}
          </Fragment>
        );
      })}
    </div>
  );
};

export default CustomSteps;

export type { CustomStepsProps, StepItem };
