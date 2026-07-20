import { CustomResult } from '@/components';

import styles from './style.module.css';

const Forbidden = () => {
  return (
    <div className={styles.container}>
      <CustomResult status="403" />
    </div>
  );
};

export default Forbidden;
