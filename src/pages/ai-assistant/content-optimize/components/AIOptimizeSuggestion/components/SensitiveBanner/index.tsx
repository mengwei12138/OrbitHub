import { AlertFilled } from '@ant-design/icons';

import styles from './style.module.css';

const SensitiveBanner = () => {
  return (
    <div className={styles.sensitiveBanner}>
      <AlertFilled className={styles.icon} />
      <div className={styles.content}>
        <span className={styles.title}>生成内容含违规词，已自动拦截</span>
        <span className={styles.desc}>
          已通过第三方内容安全服务检测，请人工审核或调整后再发布。
        </span>
      </div>
    </div>
  );
};

export default SensitiveBanner;
