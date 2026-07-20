# 项目约定

## 技术栈

- React 18 + TypeScript + Vite
- UI: Ant Design 5.29.x + @ant-design/pro-components 2.8.x
- 图表: @ant-design/charts 2.6.x
- 请求: axios（HTTP 客户端）+ TanStack Query（请求管理）
- 状态管理: Zustand（客户端状态）+ TanStack Query（服务端状态）
- 包管理器: pnpm

## 依赖版本约定

- **版本格式**：`major.minor.patch`
- **patch 部分**：固定使用 `x`（如 `6.3.x` 表示该 minor 版本的最新补丁）
- **示例**：
  - `Ant Design 6.3.x` → 实际安装 `6.3.0` 或更高 `6.3.x` 版本
  - `antd 6.x` → ❌ 不允许，必须精确到 minor
  - `react 19.x` → ❌ 不允许，必须精确到 minor

## 目录结构

- `[]` 表示可选，名称里面不允许包含 `[]`

```text
├── AGENTS.md                                    # 项目级约定
├── tests/                                       # 测试配置目录
│   └── vitest-setup.ts                         # Vitest 全局配置
├── src/
│   ├── global.d.ts                              # 全局类型定义（window 扩展等）
│   ├── vite-env.d.ts                            # Vite 环境变量类型
│   ├── styles/                                   # 全局样式目录
│   │   ├── common/                              # 公共样式目录
│   │   │   ├── vars.css                        # Figma 基础设计变量（CSS）
│   │   │   └── vars.ts                        # Figma 基础设计变量（TypeScript 常量）
│   │   ├── {page-name}/                        # 页面模块样式目录（如 account/）
│   │   │   ├── vars.css                       # 页面模块设计变量（引用 common/vars.css）
│   │   │   └── vars.ts                        # 页面模块设计变量（引用 common/vars.ts）
│   │   └── global.css                          # 全局 CSS 变量与样式
│   ├── assets/                                   # 静态资源目录
│   │   └── fonts/                               # 字体文件
│   ├── images/                                  # 图片资源目录
│   ├── api/                                       # API 基础设施目录
│   │   ├── index.ts                             # 统一导出入口
│   │   ├── request.ts                           # 请求实例
│   │   ├── queryClient.ts                       # TanStack Query Client 配置
│   │   ├── types.ts                             # 类型定义
│   │   └── __tests__/
│   │       └── index.test.ts                   # API 单元测试
│   ├── services/                                  # 业务 API 目录
│   │   ├── index.ts                             # 统一导出入口
│   │   └── {service-name}/                       # 业务 API 模块，如 loan/
│   │       ├── index.ts                         # 业务 API 入口
│   │       ├── queryOptions.ts                  # TanStack Query 配置
│   │       ├── useXXX.ts                       # Query Hooks（如 useUser）
│   │       └── __tests__/
│   │           └── index.test.ts               # 业务 API 单元测试
│   ├── pages/                                     # 页面目录（kebab-case）
│   │   └── {page-name}/                          # 页面
│   │       ├── index.tsx                         # 页面入口
│   │       ├── style.module.css                  # 页面样式
│   │       ├── AGENTS.md                         # 页面级约定
│   │       ├── swimlane.svg                      # 交互泳道图
│   │       ├── __tests__/
│   │       │   ├── index.test.tsx               # 页面单元测试
│   │       │   ├── requirements.steps.tsx     # 需求 BDD Step
│   │       │   └── test.steps.tsx             # 测试 BDD Step
│   │       ├── features/
│   │       │   ├── requirements.feature         # 需求 Feature 文件
│   │       │   └── test.feature                 # 测试 Feature 文件
│   │       ├── [components/]                     # 页面私有组件（可选）
│   │       │   └── {ComponentName}/
│   │       │       ├── index.tsx
│   │       │       ├── style.module.css
│   │       │       ├── [AGENTS.md]              # 组件级约定（可选）
│   │       │       ├── [swimlane.svg]           # 交互泳道图（可选）
│   │       │       └── __tests__/
│   │       │           └── index.test.tsx
│   │       └── [{sub-page-name}/]                # 子页面（可选，可递归嵌套）
│   │           ├── index.tsx
│   │           ├── style.module.css
│   │           ├── AGENTS.md
│   │           ├── swimlane.svg
│   │           ├── __tests__/
│   │           │   ├── index.test.tsx
│   │           │   ├── requirements.steps.tsx
│   │           │   └── test.steps.tsx
│   │           ├── features/
│   │           │   ├── requirements.feature     # 需求 Feature 文件
│   │           │   └── test.feature           # 测试 Feature 文件
│   │           ├── [components/]
│   │           │   └── {ComponentName}/
│   │           │       ├── index.tsx
│   │           │       ├── style.module.css
│   │           │       ├── [AGENTS.md]
│   │           │       ├── [swimlane.svg]
│   │           │       └── __tests__/
│   │           │           └── index.test.tsx
│   │           └── [{sub-sub-page-name}/]         # 子页面的子页面（递归同理）
│   │               ├── index.tsx
│   │               ├── style.module.css
│   │               ├── AGENTS.md
│   │               ├── swimlane.svg
│   │               ├── __tests__/
│   │               │   ├── index.test.tsx
│   │               │   ├── requirements.steps.tsx
│   │               │   └── test.steps.tsx
│   │               ├── features/
│   │               │   ├── requirements.feature   # 需求 Feature 文件
│   │               │   └── test.feature         # 测试 Feature 文件
│   │               ├── [components/]
│   │               │   └── {ComponentName}/
│   │               │       ├── index.tsx
│   │               │       ├── style.module.css
│   │               │       ├── [AGENTS.md]
│   │               │       ├── [swimlane.svg]
│   │               │       └── __tests__/
│   │               │           └── index.test.tsx
│   │               └── [{sub-sub-sub-page-name}/]   # 递归层级以此类推
│   │                   └── ...
│   ├── components/                                 # 公共组件目录（PascalCase）
│   │   ├── index.ts                              # 统一导出入口
│   │   └── {ComponentName}/
│   │       ├── index.tsx
│   │       ├── [style.module.css]                   # 可选
│   │       ├── [AGENTS.md]                          # 组件级约定（可选）
│   │       ├── [swimlane.svg]                       # 交互泳道图（可选）
│   │       └── __tests__/
│   │           └── index.test.tsx
│   ├── hooks/                                     # hooks 目录（camelCase）
│   │   └── {hookName}/
│   │       ├── index.ts
│   │       └── __tests__/
│   │           └── index.test.ts
│   ├── utils/                                     # 工具函数目录（kebab-case）
│   │   └── {util-name}/
│   │       ├── index.ts
│   │       └── __tests__/
│   │           └── index.test.ts
│   ├── layouts/                                   # 布局组件目录（PascalCase）
│   │   ├── index.ts                              # 统一导出入口
│   │   └── {LayoutName}/
│   │       ├── index.tsx
│   │       ├── style.module.css
│   │       └── __tests__/
│   │           └── index.test.ts               # 布局单元测试
│   ├── store/                                     # Zustand 状态管理目录
│   │   ├── index.ts                             # 统一导出入口
│   │   ├── types.ts                             # Store 类型定义
│   │   ├── __tests__/
│   │   │   └── index.test.ts                   # Store 单元测试
│   │   └── modules/                             # Store 模块
│   │       └── {moduleName}Store.ts            # 模块文件（如 userStore、themeStore、uiStore）
│   ├── routes/                                    # 路由配置目录
│   │   ├── index.tsx                             # 路由配置入口
│   │   ├── types.ts                              # 路由类型定义
│   │   └── __tests__/
│   │       └── index.test.tsx                    # 路由单元测试
│   └── types/                                     # 类型定义目录
│       ├── index.ts                              # 统一导出入口
│       └── {type-name}.ts                        # 类型定义
```

## 代码规范

### 构建规范

- 编译输出目录：`build/`

### 注释与命名

- **注释使用中文**
- describe/test/it 等测试命名使用中文描述

### 异步处理

- **优先使用 `async/await/trycatch`**，非必要不使用 `then/catch`

### 类型定义

- **优先使用 `type` 定义类型**，非必要不使用 `interface`

### OpenAPI 类型规范

- 读取 OpenAPI 文件时，忽略 `id` 相关字段的类型定义，一律使用 `string`
- `id` 相关字段包括：所有包含 `Id` 或 `_id` 后缀的字段（如 `userId`、`product_id` 等）
- 原因：避免 Long 类型 id 在 JavaScript 前端处理时的精度丢失问题

### 空值安全

- **使用可选链 `?.` 和空值合并 `??` 进行空值保护**

### 导入规范

- `@/` 指向 `src/`，所有来自 `src/` 内部的导入必须使用 `@/` 路径别名
- 同级目录或文件使用 `./` 或 `../`

## 组件使用规范

### 通用表格组件

| 场景 | 推荐 | 备选 |
| --- | --- | --- |
| 功能完整列表（搜索/分页/工具栏） | `CustomProTable` | `ProTable` |
| 简单列表展示 | `CustomTable` | `antd Table` |
| 可编辑列表（行编辑） | `CustomEditableProTable` | `EditableProTable` |
| 拖拽排序列表 | `CustomDragSortTable` | `DragSortTable` |

### 通用弹窗组件

| 场景       | 推荐                    | 备选              |
| ---------- | ----------------------- | ----------------- |
| 弹窗表单   | `CustomModal`           | `ModalForm`       |
| 抽屉表单   | `CustomDrawer`          | `DrawerForm`      |
| 确认对话框 | `CustomModal.confirm()` | `Modal.confirm()` |
| 成功提示   | `CustomModal.success()` | `Modal.success()` |
| 错误提示   | `CustomModal.error()`   | `Modal.error()`   |
| 警告提示   | `CustomModal.warning()` | `Modal.warning()` |
| 信息提示   | `CustomModal.info()`    | `Modal.info()`    |

### 通用图表组件

| 场景   | 推荐               | 备选                      |
| ------ | ------------------ | ------------------------- |
| 折线图 | `CustomChart.Line` | `@ant-design/charts Line` |
| 柱状图 | `CustomChart.Bar`  | `@ant-design/charts Bar`  |
| 饼图   | `CustomChart.Pie`  | `@ant-design/charts Pie`  |

### 通用空状态组件

| 场景         | 推荐          | 备选         |
| ------------ | ------------- | ------------ |
| 无数据空状态 | `CustomEmpty` | `antd Empty` |

## 样式规范

### 样式优先级

从高到低：

1. **CSS Modules** - 组件/页面级自定义样式（最高优先级）
2. **stylish** - Pro 组件内部区域定制（仅 Pro 系列）
3. **ConfigProvider + token** - 应用级全局主题
4. **styles/global.css** - 全局 CSS Variables（最低优先级）

### Ant Design 样式定制方式

| 方式 | 适用场景 | 说明 |
| --- | --- | --- |
| CSS Modules | 组件/页面自定义样式 | 项目统一使用 `style.module.css` |
| stylish | Pro 组件内部区域 | 仅 ProLayout、ProMenu、ProCard 等可用 |
| ConfigProvider + token | 全局主题配置 | 在根组件或 Layout 中使用 |
| styles/global.css | 全局 CSS Variables | 定义全局基础 token |

### 各目录样式方案

| 目录        | 样式方案                               |
| ----------- | -------------------------------------- |
| styles/     | CSS Variables（全局基础 token）        |
| layouts/    | ConfigProvider + stylish + CSS Modules |
| pages/      | CSS Modules                            |
| components/ | CSS Modules                            |
| hooks/      | CSS Modules                            |
| utils/      | CSS Modules                            |

### CSS Modules 命名（必须不可违背）

- **文件命名**：`style.module.css`
- **类名命名（必须不可违背）**：
  - CSS 文件中定义：kebab-case（如 `.content-wrapper {}`），**不可以出现** `.contentWrapper {}`
  - TS/TSX 文件中引用：camelCase（如 `styles.contentWrapper`），**不可以出现** `styles['content-wrapper']`

## 测试规范

### 测试文件

| 文件 | 类型 | 说明 |
| --- | --- | --- |
| `*.test.ts` / `*.test.tsx` | 单元测试 | 基础功能测试，describe-it 结构 |
| `requirements.steps.ts` / `requirements.steps.tsx` | 需求 BDD Step | 需求场景步骤实现，defineSteps-Given-When-Then 结构 |
| `test.steps.ts` / `test.steps.tsx` | 测试 BDD Step | 测试用例步骤实现，defineSteps-Given-When-Then 结构 |
| `features/requirements.feature` | 需求 Feature | 需求场景描述，自然语言 Given-When-Then |
| `features/test.feature` | 测试 Feature | 测试用例描述，自然语言 Given-When-Then |

### 文件关系

- `features/requirements.feature` 定义业务需求场景（Given-When-Then 描述）
- `features/test.feature` 定义测试用例场景（Given-When-Then 描述）
- `requirements.steps.ts` / `requirements.steps.tsx` 实现 requirements.feature 中的步骤
- `test.steps.ts` / `test.steps.tsx` 实现 test.feature 中的步骤
- `*.test.ts` / `*.test.tsx` 独立的基础功能单元测试

### BDD 风格

- 使用 **Given-When-Then** 格式
- 本项目统一使用 `@amiceli/vitest-cucumber` 的 `defineFeature`

#### 文件结构

```text
├── __tests__/
│   ├── requirements.steps.tsx       # 需求步骤实现文件
│   ├── test.steps.tsx              # 测试步骤实现文件
│   └── index.test.tsx              # 独立单元测试
└── features/
    ├── requirements.feature         # 需求场景描述
    └── test.feature                 # 测试用例描述
```

#### 步骤实现约定

```typescript
import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('场景描述', ({ Given, When, Then, And }) => {
    Given('前置条件', () => {
      // 实现
    });
    When('操作行为', () => {
      // 实现
    });
    Then('预期结果', () => {
      // 实现
    });
  });
});
```

#### 规则

- `Scenario` 回调参数使用解构：`({ And, But, Given, When, Then }) =>`
- 禁止使用 `test.And`、`test.But`、`test.Given`、`test.When`、`test.Then`
- 步骤函数必须在 `Scenario` 回调内部定义
- `Given` - 前置条件/初始状态
- `When` - 用户操作/触发事件
- `Then` - 预期结果/断言
- `And` / `But` - 补充步骤
- 如果步骤中没有使用到方法，不要添加多余的解构

### Vitest 配置

- 全局配置文件：`tests/vitest-setup.ts`
- 必须在该文件中导入 `@testing-library/jest-dom`
- 配置文件路径在 `vitest.config.ts` 的 `setupFiles` 中指定

### 运行测试

```bash
pnpm test              # 运行所有测试
pnpm test:coverage  # 生成覆盖率报告
pnpm test -- --watch    # 监听模式
```

## 代码质量检查

```bash
pnpm lint              # Biome 检查 + Stylelint 检查
pnpm lint -- --fix     # Biome 修复 + Stylelint 修复
pnpm lint:style        # Stylelint 检查
pnpm lint:style -- --fix  # Stylelint 修复
```

### Biome 配置

Biome 配置位于 `biome.json`，主要规则：

| 规则类型 | 说明 |
| -------- | ---- |
| `recommended` | 启用推荐规则集 |
| `organizeImports` | 自动排序导入语句 |
| `useImportType` | 使用 `import type` 导入类型（warn） |

### Stylelint 规则重点

- CSS 属性排序：`stylelint-order`
- 标准 CSS 规范：`stylelint-config-standard`

## Git Hooks

### 工具

- **husky**: Git hooks 管理
- **lint-staged**: 对 staged 文件执行检查

### pre-commit hook

- 先执行 `lint-staged` 对 staged 文件进行 lint 和 fix
- lint-staged 成功后执行 `npm run test` 运行测试

## 状态管理规范

### 职责划分

| 库                 | 职责       | 处理内容                             |
| ------------------ | ---------- | ------------------------------------ |
| **Zustand**        | 客户端状态 | Token、用户信息、主题、语言、UI 状态 |
| **TanStack Query** | 服务端状态 | API 请求、缓存、轮询、自动重新验证   |

### Zustand Store 规范

- Store 模块放在 `src/store/modules/` 目录下
- 每个 Store 使用 `create` + `persist` 中间件实现持久化
- Token 存储在 userStore，通过 persist 中间件同步到 localStorage

### TanStack Query 规范

- Query Client 配置在 `src/api/queryClient.ts`
- 业务 API Hooks 放在 `src/services/{service}/` 目录下
- 使用 `queryOptions` 封装查询配置，支持类型安全
