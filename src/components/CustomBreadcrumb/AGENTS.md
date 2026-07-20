# CustomBreadcrumb 组件约定

## 简介

基于 antd Breadcrumb 封装，提供自动生成和自定义面包屑导航功能。

## 使用场景

- 页面导航路径展示
- 带操作的面包屑导航
- 根据路由自动生成面包屑

## 代码示例

```tsx
import { CustomBreadcrumb } from '@/components';
import type { CustomBreadcrumbProps } from '@/components';

// 基础用法
<CustomBreadcrumb />

// 带工具栏
<CustomBreadcrumb
  toolBar={<Button>操作</Button>}
/>

// 自定义特定页面
const { setOverride } = useBreadcrumbStore();
useEffect(() => {
  setOverride('/user/:id', {
    items: [{ name: '用户管理' }, { name: '用户详情' }],
    toolBar: <Button>编辑</Button>
  });
}, []);
```

## Props

| 属性      | 类型        | 默认值      | 说明                   |
| --------- | ----------- | ----------- | ---------------------- |
| `toolBar` | `ReactNode` | `undefined` | 面包屑右侧的工具栏内容 |

## 注意事项

1. **自动生成**：默认根据路由配置自动生成面包屑
2. **override 优先级**：通过 store 设置的 override 优先于自动生成
3. **少于 2 项**：面包屑少于 2 项时不显示

## 依赖

- antd Breadcrumb
- useBreadcrumbItems hook
- useBreadcrumbStore
