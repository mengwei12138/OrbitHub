import type { ResultProps } from 'antd';

import { Result } from 'antd';
import type React from 'react';

export type CustomResultProps = Omit<ResultProps, 'status'> & {
  status?: ResultProps['status'];
};

const CustomResult: React.FC<CustomResultProps> = (props) => {
  return <Result {...props} />;
};

export default CustomResult;
