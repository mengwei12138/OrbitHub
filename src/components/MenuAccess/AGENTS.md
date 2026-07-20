# MenuAccess 组件约定

## 简介

基于 `Access` 组件封装的菜单级权限控制组件，用于控制菜单项或菜单组的显示/隐藏。

## 使用场景

- 菜单项的权限控制
- 根据用户权限动态显示/隐藏菜单
- 与路由守卫配合的菜单级权限控制

## 代码示例

```tsx
import { MenuAccess } from '@/components';

// 菜单项权限控制
<MenuAccess access="user:create">
  <MenuItem key="create-user" icon={<UserAddIcon />}>
    新建用户
  </MenuItem>
</MenuAccess>

// 菜单组权限控制
<MenuAccess access="system:settings">
  <SubMenu key="system" title="系统设置">
    <MenuItem key="role">角色管理</MenuItem>
    <MenuItem key="permission">权限管理</MenuItem>
  </SubMenu>
</MenuAccess>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `access` | `string` | - | 权限标识，格式为 `模块:操作`（如 `user:create`） |
| `children` | `ReactNode` | - | 子元素 |

## 注意事项

- 依赖全局常量 `ENABLE_ACCESS_CHECK`，为 `false` 时跳过权限检查直接渲染 children
- 权限校验失败时渲染 `/403` 页面
- 实际权限校验由 `Access` 组件通过后端接口完成
- 权限标识格式：`模块:操作`（如 `user:create`、`system:settings`）

## 依赖

- Access 组件
- useAccess hook
