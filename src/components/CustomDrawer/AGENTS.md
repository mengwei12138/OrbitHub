# CustomDrawer 组件约定

## 简介

基于 `@ant-design/pro-components` 的 `DrawerForm` 封装，是项目标准的**抽屉表单**组件。

## 使用场景

- 侧边滑出的表单弹窗
- 编辑、新建等表单场景
- 需要临时展示详情并编辑的场景

## 代码示例

```tsx
import { CustomDrawer } from '@/components';
import type { CustomDrawerProps } from '@/components';
import { ProFormText, ProFormSelect } from '@ant-design/pro-components';

const EditUserDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  userId?: string;
}> = ({ open, onClose, userId }) => {
  return (
    <CustomDrawer
      open={open}
      title={userId ? '编辑用户' : '新建用户'}
      onFinish={async (values) => {
        await saveUser(values);
        onClose();
        return true;
      }}
      initialValues={fetchUserData(userId)}
    >
      <ProFormText name="name" label="姓名" rules={[{ required: true }]} />
      <ProFormSelect name="role" label="角色" options={roleOptions} />
    </CustomDrawer>
  );
};
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | - | 抽屉标题 |
| `footer` | `ReactNode \| null` | 默认按钮 | 自定义 footer，为 `null` 时不显示默认按钮 |
| `open` | `boolean` | - | 控制抽屉显示/隐藏 |
| `onFinish` | `(values: V) => Promise<boolean>` | - | 表单提交回调，返回 `true` 关闭抽屉 |
| `width` | `number \| string` | `520` | 抽屉宽度 |
| `placement` | `'left' \| 'right'` | `'right'` | 抽屉位置 |
| `maskClosable` | `boolean` | `false` | 点击遮罩是否关闭 |
| `keyboard` | `boolean` | `false` | ESC 键是否关闭 |

> 其他 `@ant-design/pro-components` `DrawerFormProps` 支持的 props 均可用。

## 注意事项

- 默认 `width` 为 `520`
- 默认 `placement` 为 `right`（右侧滑出）
- 设为 `footer={null}` 可隐藏底部按钮

## 依赖

- @ant-design/pro-components DrawerForm
- antd Drawer
