import { Progress } from 'antd';
import { forwardRef } from 'react';

import type { CustomProgressProps, CustomProgressRef } from './types';

const CustomProgress = forwardRef<CustomProgressRef, CustomProgressProps>(
  (props, ref) => {
    return <Progress ref={ref} {...props} />;
  },
);

CustomProgress.displayName = 'CustomProgress';

export default CustomProgress;

export type { CustomProgressProps, CustomProgressRef };
