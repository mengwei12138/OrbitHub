import { Modal, Spin } from 'antd';
import type { FC } from 'react';

import styles from './style.module.css';

export type LoginProcessingModalProps = {
  visible: boolean;
};

/** 手机验证提交后、进入扫码步骤前的全屏加载提示 */
export const LoginProcessingModal: FC<LoginProcessingModalProps> = ({
  visible,
}) => (
  <Modal
    open={visible}
    footer={null}
    closable={false}
    maskClosable={false}
    keyboard={false}
    centered
    width={360}
    destroyOnClose
    title={null}
  >
    <div className={styles.body} data-testid="login-processing-modal">
      <Spin size="large" />
      <p className={styles.text}>正在登陆中</p>
      <p className={styles.hint}>请稍候，验证通过后将自动进入下一步</p>
    </div>
  </Modal>
);

export default LoginProcessingModal;
