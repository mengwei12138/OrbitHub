# CustomResult 组件约定

## 简介

基于 antd `Result` 封装的通用结果展示组件，完全透传 antd Result 所有 props。

## 使用场景

- 操作成功/失败的结果反馈
- 404/403/500 等错误页面
- 状态展示结果页面

## 代码示例

```tsx
import { CustomResult } from '@/components';

// 成功结果
<CustomResult
  status="success"
  title="操作成功"
  subTitle="用户已成功创建，页面将自动跳转"
/>

// 失败结果
<CustomResult
  status="error"
  title="操作失败"
  subTitle="请稍后重试或联系管理员"
/>

// 404 结果
<CustomResult
  status="404"
  title="页面不存在"
  subTitle="请检查 URL 是否正确"
/>

// 自定义操作
<CustomResult
  status="success"
  title="提交成功"
  extra={<Button type="primary" onClick={() => navigate('/list')}>返回列表</Button>}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `status` | `success \| error \| info \| warning \| 404 \| 403 \| 500` | `undefined` | 结果状态（antd Result 原版为必填，此处改为可选） |
| `title` | `ReactNode` | - | 标题 |
| `subTitle` | `ReactNode` | - | 副标题 |
| `extra` | `ReactNode` | - | 额外内容（如操作按钮） |
| `icon` | `ReactNode` | - | 自定义图标 |
| `children` | `ReactNode` | - | 子内容 |

> 其他 antd `Result` 组件支持的 props 均可用，组件完全透传。

## 注意事项

- `status` 改为可选，提供更灵活的使用方式
- 完全透传 antd `Result` 的所有 props

## 依赖

- antd Result
