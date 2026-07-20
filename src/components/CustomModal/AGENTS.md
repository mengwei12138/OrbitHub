# CustomModal 组件约定

## 简介

基于 `@ant-design/pro-components` 的 `ModalForm` 封装，是项目标准的**模态框表单**组件。同时保留 antd `Modal` 的所有静态方法。

## 使用场景

- 居中弹出的表单弹窗
- 新建、编辑、详情确认等表单场景
- 需要使用 `confirm()`、`success()`、`error()` 等静态方法的场景

## 代码示例

```tsx
import { CustomModal } from '@/components';
import type { CustomModalProps } from '@/components';
import { ProFormText, ProFormSelect } from '@ant-design/pro-components';

// 表单弹窗
const CreateUserModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  return (
    <CustomModal
      open={open}
      title="新建用户"
      onFinish={async (values) => {
        await createUser(values);
        onClose();
        return true;
      }}
    >
      <ProFormText name="name" label="姓名" rules={[{ required: true }]} />
      <ProFormSelect name="role" label="角色" options={roleOptions} />
    </CustomModal>
  );
};

// 确认对话框
CustomModal.confirm({
  title: '确认删除',
  content: '删除后数据无法恢复，是否继续？',
  onOk: async () => {
    await deleteItem(id);
  },
});

// 成功提示
CustomModal.success({
  title: '操作成功',
  content: '用户已成功创建',
});
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | - | 弹窗标题 |
| `footer` | `ReactNode \| null` | 默认按钮 | 自定义 footer，为 `null` 时不显示默认按钮 |
| `open` | `boolean` | - | 控制弹窗显示/隐藏 |
| `onFinish` | `(values: V) => Promise<boolean>` | - | 表单提交回调，返回 `true` 关闭弹窗 |
| `width` | `number` | `520` | 弹窗宽度 |
| `centered` | `boolean` | `true` | 居中显示 |
| `maskClosable` | `boolean` | `false` | 点击遮罩是否关闭 |
| `keyboard` | `boolean` | `false` | ESC 键是否关闭 |
| `okText` | `string` | `"确定"` | 确定按钮文字 |
| `cancelText` | `string` | `"取消"` | 取消按钮文字 |

> 其他 `@ant-design/pro-components` `ModalFormProps` 支持的 props 均可用。

## 静态方法

| 方法                    | 说明       |
| ----------------------- | ---------- |
| `CustomModal.confirm()` | 确认对话框 |
| `CustomModal.success()` | 成功提示   |
| `CustomModal.error()`   | 错误提示   |
| `CustomModal.warning()` | 警告提示   |
| `CustomModal.info()`    | 信息提示   |

## 依赖

- @ant-design/pro-components ModalForm
- antd Modal
