/**
 * CustomModal - 基于 antd ModalForm 封装的通用模态框组件
 *
 * 完全继承 antd ModalForm 的默认行为，仅对以下功能做定制化配置：
 * - 默认配置：maskClosable: false、keyboard: false、width: 520、centered: true
 * - 默认 submitter：包含取消/确定按钮，靠右对齐
 * - 保留 antd ModalForm 的所有静态方法（confirm、success、error、warning、info）
 *
 * @description 通用业务模态框组件，适用于大多数弹窗场景
 * @example
 * // 表单弹窗
 * <CustomModal
 *   open={visible}
 *   title="新建用户"
 *   onFinish={async (values) => {
 *     await createUser(values);
 *     return true;
 *   }}
 * >
 *   <ProFormText name="name" label="姓名" />
 * </CustomModal>
 */

import type {
  ModalFormProps,
  SubmitterProps,
} from '@ant-design/pro-components';

import { ModalForm } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { type ReactNode } from 'react';

export type CustomModalProps<
  V extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>,
> = Omit<ModalFormProps<V, U>, 'title'> & {
  /** 自定义 footer，为 null 时不显示默认按钮 */
  footer?: ReactNode | null;
  /** 标题 */
  title?: ModalFormProps<V, U>['title'];
};

const CustomModal: React.FC<CustomModalProps> & {
  confirm: typeof Modal.confirm;
  success: typeof Modal.success;
  error: typeof Modal.error;
  warning: typeof Modal.warning;
  info: typeof Modal.info;
} = (props) => {
  const { footer, submitter, title, ...rest } = props;

  const mergedSubmitter = React.useMemo<
    SubmitterProps | false | undefined
  >(() => {
    if (footer === null) {
      return false;
    }
    if (footer !== undefined) {
      return footer as SubmitterProps;
    }
    if (submitter === false) {
      return false;
    }
    if (submitter === undefined) {
      return { cancelText: '取消', okText: '确定' };
    }
    return { cancelText: '取消', okText: '确定', ...submitter };
  }, [footer, submitter]);

  const { modalProps, ...formRest } = rest;

  return (
    <ModalForm
      width={520}
      title={title}
      submitter={mergedSubmitter}
      modalProps={{
        maskClosable: false,
        keyboard: false,
        centered: true,
        okText: '确定',
        cancelText: '取消',
        ...modalProps,
      }}
      {...formRest}
    />
  );
};

CustomModal.confirm = (props) =>
  Modal.confirm({ cancelText: '取消', okText: '确定', ...props });
CustomModal.success = (props) =>
  Modal.success({ cancelText: '取消', okText: '确定', ...props });
CustomModal.error = (props) =>
  Modal.error({ cancelText: '取消', okText: '确定', ...props });
CustomModal.warning = (props) =>
  Modal.warning({ cancelText: '取消', okText: '确定', ...props });
CustomModal.info = (props) =>
  Modal.info({ cancelText: '取消', okText: '确定', ...props });

export default CustomModal;
