# Access 组件约定

## 简介

基于路由权限判断的权限控制组件，根据传入的权限路径判断当前用户是否有权限访问。

## 使用场景

- 细粒度的权限控制
- 根据用户权限动态显示/隐藏功能按钮
- 与 `MenuAccess` 配合实现菜单级权限控制

## 代码示例

```tsx
import { Access } from '@/components';
import type { AccessProps } from '@/components';

// 权限控制
<Access path="/api/users/delete">
  <Button>删除用户</Button>
</Access>

// 自定义无权限展示
<Access
  path="/api/users/delete"
  fallback={<Button disabled>无权限</Button>}
>
  <Button>删除用户</Button>
</Access>
```

## Props

| 属性       | 类型        | 默认值   | 说明                             |
| ---------- | ----------- | -------- | -------------------------------- |
| `path`     | `string`    | **必填** | 权限路径，需要与后端权限配置一致 |
| `fallback` | `ReactNode` | `null`   | 无权限时显示的备选内容           |
| `children` | `ReactNode` | -        | 组件子元素（有权限时显示）       |

## 注意事项

1. **path 参数**：权限路径，需要与后端权限配置一致
2. **fallback 默认值**：默认为 `null`，即无权限时不显示
3. **开发环境**：权限检查默认关闭，可通过 `ENABLE_ACCESS_CHECK` 常量控制
4. **MenuAccess 组件**：如果需要配合菜单使用，推荐使用 `MenuAccess` 组件

## 依赖

- useAccess hook (from `@/hooks/useAccess`)
