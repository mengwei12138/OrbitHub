import { CustomResult } from '@/components';

import styles from './style.module.css';

const ServerError = () => {
  return (
    <div className={styles.container}>
      <CustomResult status="500" />
    </div>
  );
};

export default ServerError;
