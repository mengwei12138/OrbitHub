import { Empty } from 'antd';
import type { FC } from 'react';

type CustomEmptyProps = {
  description?: string | null;
  onClick?: () => void;
};

const CustomEmpty: FC<CustomEmptyProps> = ({
  description = null,
  onClick,
  ...props
}) => {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Empty
        description={description}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        {...props}
      />
    </div>
  );
};

export default CustomEmpty;
