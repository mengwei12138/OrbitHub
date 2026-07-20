/**
 * CustomDrawer - 基于 antd DrawerForm 封装的通用抽屉组件
 *
 * 完全继承 antd DrawerForm 的默认行为，仅对以下功能做定制化配置：
 * - 默认配置：maskClosable: false、keyboard: false、width: 520、placement: right
 * - 默认 submitter：包含取消/确定按钮，靠右对齐
 * - 支持宽度拖拽调整（resize）
 *
 * @description 通用业务抽屉组件，适用于大多数侧边抽屉场景
 * @example
 * // 表单抽屉
 * <CustomDrawer
 *   open={visible}
 *   title="编辑用户"
 *   onFinish={async (values) => {
 *     await updateUser(values);
 *     return true;
 *   }}
 * >
 *   <ProFormText name="name" label="姓名" />
 * </CustomDrawer>
 */

import type {
  DrawerFormProps,
  SubmitterProps,
} from '@ant-design/pro-components';

import { DrawerForm } from '@ant-design/pro-components';
import React, { type ReactNode } from 'react';

export type CustomDrawerProps<
  V extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>,
> = Omit<DrawerFormProps<V, U>, 'title'> & {
  /** 自定义 footer，为 null 时不显示默认按钮 */
  footer?: ReactNode | null;
  /** 标题 */
  title?: DrawerFormProps<V, U>['title'];
};

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  const { footer, submitter, title, resize, ...rest } = props;

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
    return submitter;
  }, [footer, submitter]);

  const { drawerProps, ...formRest } = rest;

  return (
    <DrawerForm
      width={520}
      title={title}
      resize={resize}
      submitter={mergedSubmitter}
      drawerProps={{
        maskClosable: false,
        keyboard: false,
        placement: 'right',
        ...drawerProps,
      }}
      {...formRest}
    />
  );
};

export default CustomDrawer;
