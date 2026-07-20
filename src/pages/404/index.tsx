import { CustomResult } from '@/components';

import styles from './style.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <CustomResult status="404" />
    </div>
  );
};

export default NotFound;
