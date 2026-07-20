---
name: wireframe-generator
description: 将用户故事转换为可交互的HTML原型。当用户提到"生成线框图"、"创建原型"、"画页面原型"、"设计界面"、"wireframe"、"线框"、"原型设计"、"生成HTML原型"、"创建可交互原型"时触发。此技能适用于产品经理、UI设计师、开发人员需要快速生成可预览、可交互的页面原型的场景。
---

# 线框原型生成器

将用户故事转换为可交互的 HTML 原型，可在浏览器或手机中直接预览。

## 输入

用户提供用户故事（可以是之前生成的或自行编写的用户故事），包含：
- 角色（As a...）
- 功能（I want...）
- 验收条件（Given-When-Then）

## 输出

生成单个 HTML 文件，包含：
- 完整的 HTML 结构
- 内联 CSS 样式（移动端优先，响应式设计）
- JavaScript 交互逻辑（页面跳转、弹窗、表单等）
- 多个页面的模拟（通过 JavaScript 控制显示/隐藏）

## 设计规范

### 统一间距系统
| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 紧凑元素间距 |
| sm | 8px | 小间距 |
| md | 16px | 标准间距 |
| lg | 24px | 大间距 |
| xl | 32px | 区块间距 |

### 圆角规范
- 小圆角：4px（标签、小按钮）
- 标准圆角：8px（按钮、输入框、卡片）
- 大圆角：12px（弹窗、大卡片）
- 全圆：50%（头像、图标背景）

### 颜色系统
| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | #07c160 | 微信绿、成功状态 |
| 次要色 | #1989fa | 链接、辅助操作 |
| 警告色 | #ff976a | 警告提示 |
| 错误色 | #ee0a24 | 错误提示 |
| 背景色 | #f5f5f5 | 页面背景 |
| 卡片背景 | #ffffff | 卡片/容器背景 |
| 文字主色 | #333333 | 主要文字 |
| 文字次要 | #666666 | 次要文字 |
| 文字弱化 | #999999 | 提示文字 |
| 边框色 | #ebedf0 | 分割线、边框 |

## HTML 原型模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>[页面标题]</title>
  <style>
    /* ========== 基础重置 ========== */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: #f5f5f5;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* ========== 手机容器 ========== */
    .phone-container {
      max-width: 375px;
      margin: 20px auto;
      background: #fff;
      min-height: 100vh;
      position: relative;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }

    /* ========== 状态栏 ========== */
    .status-bar {
      background: #fff;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #333;
    }

    /* ========== 导航栏 ========== */
    .nav-bar {
      background: #fff;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ebedf0;
    }

    .nav-bar .nav-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }

    .nav-bar .nav-back {
      font-size: 16px;
      color: #07c160;
      cursor: pointer;
      min-width: 60px;
    }

    .nav-bar .nav-more {
      font-size: 18px;
      cursor: pointer;
      min-width: 60px;
      text-align: right;
    }

    /* ========== 页面内容区 ========== */
    .page-content {
      padding: 16px;
      padding-bottom: 80px;
    }

    /* ========== 底部操作栏 ========== */
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 375px;
      background: #fff;
      padding: 12px 16px;
      border-top: 1px solid #ebedf0;
      display: flex;
      gap: 12px;
    }

    /* ========== 按钮系统 ========== */
    /* 基础按钮 */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      cursor: pointer;
      border: none;
      outline: none;
      transition: all 0.2s ease;
      /* 统一点击效果 */
      -webkit-tap-highlight-color: transparent;
    }

    .btn:active {
      opacity: 0.8;
      transform: scale(0.98);
    }

    /* 全宽按钮 - 主要操作按钮 */
    .btn-block {
      width: 100%;
      padding: 14px 24px;
    }

    /* 固定宽度按钮 */
    .btn-fixed {
      padding: 12px 16px;
      min-width: 80px;
    }

    /* 按钮尺寸变体 */
    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 18px;
    }

    /* 主按钮 - 微信绿 */
    .btn-primary {
      background: #07c160;
      color: #fff;
    }

    /* 次要按钮 - 灰色 */
    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    /* 描边按钮 */
    .btn-outline {
      background: transparent;
      color: #07c160;
      border: 1px solid #07c160;
    }

    /* 禁用按钮 */
    .btn-disabled {
      background: #ebedf0;
      color: #999;
      cursor: not-allowed;
    }

    .btn-disabled:active {
      opacity: 1;
      transform: none;
    }

    /* 危险按钮 - 红色 */
    .btn-danger {
      background: #ee0a24;
      color: #fff;
    }

    /* 文字按钮 - 无背景 */
    .btn-text {
      background: transparent;
      color: #07c160;
      padding: 8px 12px;
    }

    /* 按钮组 */
    .btn-group {
      display: flex;
      gap: 12px;
    }

    .btn-group .btn {
      flex: 1;
    }

    /* ========== 表单系统 ========== */
    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #ebedf0;
      border-radius: 8px;
      font-size: 16px;
      outline: none;
      background: #fff;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      border-color: #07c160;
    }

    .form-input::placeholder {
      color: #c8c8c8;
    }

    /* 输入框组合（输入框+按钮） */
    .input-group {
      display: flex;
      gap: 12px;
    }

    .input-group .form-input {
      flex: 1;
    }

    .input-group .btn {
      flex: 0 0 100px;
    }

    /* ========== 卡片 ========== */
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    /* ========== 列表 ========== */
    .list {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
    }

    .list-item {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ebedf0;
      cursor: pointer;
      transition: background 0.2s;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item:active {
      background: #f5f5f5;
    }

    .list-item-content {
      flex: 1;
    }

    .list-item-title {
      font-size: 16px;
      color: #333;
    }

    .list-item-desc {
      font-size: 13px;
      color: #999;
      margin-top: 4px;
    }

    .list-item-arrow {
      color: #c8c8c8;
      font-size: 16px;
      margin-left: 12px;
    }

    /* ========== 弹窗 ========== */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      width: calc(100% - 60px);
      max-width: 320px;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
      color: #333;
    }

    .modal-body {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
    }

    .modal-btns {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .modal-btns .btn {
      flex: 1;
    }

    /* ========== Toast 提示 ========== */
    .toast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.75);
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1001;
      max-width: 200px;
      text-align: center;
    }

    /* ========== 底部导航 ========== */
    .tab-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 375px;
      background: #fff;
      display: flex;
      justify-content: space-around;
      padding: 8px 0;
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
      border-top: 1px solid #ebedf0;
    }

    .tab-item {
      flex: 1;
      text-align: center;
      cursor: pointer;
      padding: 4px 0;
    }

    .tab-icon {
      font-size: 22px;
      margin-bottom: 2px;
    }

    .tab-label {
      font-size: 11px;
      color: #999;
    }

    .tab-item.active .tab-label {
      color: #07c160;
    }

    /* ========== 页面状态 ========== */
    .phone-container { display: none; }
    .phone-container.active { display: block; }
    .hidden { display: none !important; }

    /* ========== 空状态 ========== */
    .empty-state {
      text-align: center;
      padding: 60px 32px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
      color: #999;
    }

    /* ========== 分隔线 ========== */
    .divider {
      height: 1px;
      background: #ebedf0;
      margin: 24px 0;
    }

    .divider-text {
      display: flex;
      align-items: center;
      color: #999;
      font-size: 13px;
    }

    .divider-text::before,
    .divider-text::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #ebedf0;
    }

    .divider-text span {
      padding: 0 16px;
    }

    /* ========== 徽章 ========== */
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 500;
    }

    .badge-primary {
      background: #07c160;
      color: #fff;
    }

    .badge-danger {
      background: #ee0a24;
      color: #fff;
    }
  </style>
</head>
<body>

<!-- 页面1: 登录页（默认显示） -->
<div class="phone-container active" id="page-login">
  <div class="status-bar">
    <span>9:41</span>
    <span>📶 📡 🔋</span>
  </div>
  <div class="nav-bar">
    <span></span>
    <span class="nav-title">登录</span>
    <span></span>
  </div>

  <div class="page-content">
    <div style="text-align: center; padding: 48px 0 32px;">
      <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #07c160, #04a556); border-radius: 16px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 36px;">🍶</span>
      </div>
      <p style="font-size: 20px; font-weight: 600; margin-top: 16px; color: #333;">应用名称</p>
      <p style="color: #999; font-size: 13px; margin-top: 4px;">智慧酒类零售管理系统</p>
    </div>

    <!-- 全宽主按钮 -->
    <button class="btn btn-primary btn-block" id="btn-wechat">
      微信快速登录
    </button>

    <!-- 分隔线 -->
    <div class="divider-text" style="margin: 32px 0;">
      <span>其他登录方式</span>
    </div>

    <!-- 次要按钮 -->
    <button class="btn btn-secondary btn-block" id="btn-phone">
      手机号登录
    </button>

    <!-- 底部协议文字 -->
    <div style="position: absolute; bottom: 32px; left: 16px; right: 16px; text-align: center;">
      <span style="color: #999; font-size: 12px;">登录即表示同意</span>
      <span style="color: #1989fa; font-size: 12px;">《服务协议》</span>
      <span style="color: #999; font-size: 12px;">和</span>
      <span style="color: #1989fa; font-size: 12px;">《隐私政策》</span>
    </div>
  </div>
</div>

<!-- 页面2: 手机号登录页 -->
<div class="phone-container hidden" id="page-phone">
  <div class="status-bar">
    <span>9:41</span>
    <span>📶 📡 🔋</span>
  </div>
  <div class="nav-bar">
    <span class="nav-back" id="back-login">← 返回</span>
    <span class="nav-title">手机号登录</span>
    <span></span>
  </div>

  <div class="page-content">
    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">请输入您的手机号</p>

    <div class="form-group">
      <input type="tel" class="form-input" placeholder="请输入手机号" maxlength="11" id="phone-input">
    </div>

    <!-- 输入框+按钮组合 -->
    <div class="input-group">
      <input type="text" class="form-input" placeholder="验证码" maxlength="6">
      <button class="btn btn-secondary" id="btn-code">获取验证码</button>
    </div>

    <button class="btn btn-primary btn-block btn-disabled" style="margin-top: 24px;" id="btn-submit" disabled>登录</button>
  </div>
</div>

<!-- 页面3: 服务协议弹窗 -->
<div class="modal-overlay hidden" id="modal-agreement">
  <div class="modal-content">
    <div class="modal-title">服务协议</div>
    <div class="modal-body">
      <p style="font-weight: 600;">【服务协议】</p>
      <p style="margin-top: 12px;">欢迎使用本系统...</p>
    </div>
    <div class="modal-btns">
      <button class="btn btn-secondary" id="btn-disagree">不同意</button>
      <button class="btn btn-primary" id="btn-agree">同意并继续</button>
    </div>
  </div>
</div>

<!-- 页面4: 首页 -->
<div class="phone-container hidden" id="page-home">
  <div class="status-bar">
    <span>9:41</span>
    <span>📶 📡 🔋</span>
  </div>
  <div class="nav-bar">
    <span style="font-size: 18px;">☰</span>
    <span class="nav-title">首页</span>
    <span class="nav-more">🔔</span>
  </div>

  <div class="page-content">
    <div class="card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
      <p style="font-size: 14px; opacity: 0.9; color: #fff;">欢迎回来</p>
      <p style="font-size: 20px; font-weight: 600; margin-top: 4px; color: #fff;" id="user-name">用户</p>
    </div>

    <!-- 功能入口网格 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div style="text-align: center;">
        <div style="width: 44px; height: 44px; background: #e6f7ff; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📦</div>
        <span style="font-size: 12px; color: #666;">订单</span>
      </div>
      <div style="text-align: center;">
        <div style="width: 44px; height: 44px; background: #fff7e6; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">💰</div>
        <span style="font-size: 12px; color: #666;">钱包</span>
      </div>
      <div style="text-align: center;">
        <div style="width: 44px; height: 44px; background: #f6ffed; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">⭐</div>
        <span style="font-size: 12px; color: #666;">收藏</span>
      </div>
      <div style="text-align: center;">
        <div style="width: 44px; height: 44px; background: #fff1f0; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>
        <span style="font-size: 12px; color: #666;">地址</span>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">最近订单</span>
        <span style="color: #999; font-size: 13px;">查看全部 ›</span>
      </div>
      <div style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #ebedf0;">
        <div style="width: 56px; height: 56px; background: #f5f5f5; border-radius: 8px;"></div>
        <div style="flex: 1;">
          <p style="font-size: 14px; color: #333;">飞天茅台53度 500ml</p>
          <p style="font-size: 12px; color: #999; margin-top: 4px;">订单号: ORD20260408001</p>
        </div>
        <span style="color: #07c160; font-size: 13px;">已完成</span>
      </div>
    </div>
  </div>

  <!-- 底部Tab导航 -->
  <div class="tab-bar">
    <div class="tab-item active">
      <div class="tab-icon">🏠</div>
      <div class="tab-label">首页</div>
    </div>
    <div class="tab-item">
      <div class="tab-icon">📋</div>
      <div class="tab-label">订单</div>
    </div>
    <div class="tab-item">
      <div class="tab-icon">👤</div>
      <div class="tab-label">我的</div>
    </div>
  </div>
</div>

<script>
  // Toast 提示
  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2000);
  }

  // 页面切换
  function showPage(pageId) {
    document.querySelectorAll('.phone-container').forEach(function(p) {
      p.classList.remove('active');
      p.classList.add('hidden');
    });
    var target = document.getElementById(pageId);
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // 登录页 - 微信登录
  document.getElementById('btn-wechat').addEventListener('click', function() {
    showPage('page-phone');
  });

  // 登录页 - 手机号登录
  document.getElementById('btn-phone').addEventListener('click', function() {
    showPage('page-phone');
  });

  // 手机号登录页 - 返回
  document.getElementById('back-login').addEventListener('click', function() {
    showPage('page-login');
  });

  // 手机号登录 - 获取验证码
  document.getElementById('btn-code').addEventListener('click', function() {
    const btn = this;
    btn.textContent = '59s';
    btn.disabled = true;
    let seconds = 59;
    var timer = setInterval(function() {
      seconds--;
      btn.textContent = seconds + 's';
      if (seconds <= 0) {
        clearInterval(timer);
        btn.textContent = '获取验证码';
        btn.disabled = false;
      }
    }, 1000);
    showToast('验证码已发送');
  });

  // 手机号登录 - 登录按钮状态
  var phoneInput = document.getElementById('phone-input');
  var submitBtn = document.getElementById('btn-submit');

  phoneInput.addEventListener('input', function() {
    if (this.value.length === 11) {
      submitBtn.classList.remove('btn-disabled');
      submitBtn.classList.add('btn-primary');
      submitBtn.disabled = false;
    } else {
      submitBtn.classList.add('btn-disabled');
      submitBtn.classList.remove('btn-primary');
      submitBtn.disabled = true;
    }
  });

  // 手机号登录 - 提交
  submitBtn.addEventListener('click', function() {
    if (this.disabled) return;
    document.getElementById('modal-agreement').classList.remove('hidden');
  });

  // 弹窗 - 同意
  document.getElementById('btn-agree').addEventListener('click', function() {
    document.getElementById('modal-agreement').classList.add('hidden');
    showPage('page-home');
    showToast('登录成功');
  });

  // 弹窗 - 不同意
  document.getElementById('btn-disagree').addEventListener('click', function() {
    document.getElementById('modal-agreement').classList.add('hidden');
    showToast('请同意服务协议后继续');
  });
</script>

</body>
</html>
```

## 工作流程

### 第一步：解析用户故事
1. 提取故事中的角色和核心功能
2. 分析验收条件，识别用户操作流程
3. 确定涉及的页面数量和页面类型

### 第二步：识别页面和交互
为每个故事识别：
- 需要的页面（登录页、列表页、详情页、表单页等）
- 页面之间的跳转关系
- 涉及的操作（点击、输入、选择等）
- 交互状态（成功、失败、加载等）

### 第三步：生成 HTML 原型
- 使用模板中的 CSS 样式
- 组合需要的页面组件
- 编写 JavaScript 实现交互逻辑

### 第四步：输出文件
将完整的 HTML 代码保存到文件，文件名格式：`[功能名]_原型.html`

## 组件库

### 按钮组件

```html
<!-- 全宽主按钮 -->
<button class="btn btn-primary btn-block">主要操作</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary btn-block">次要操作</button>

<!-- 固定宽度按钮（用于输入框组合） -->
<button class="btn btn-secondary btn-fixed">获取验证码</button>

<!-- 按钮组 -->
<div class="btn-group">
  <button class="btn btn-secondary">取消</button>
  <button class="btn btn-primary">确认</button>
</div>
```

### 表单组件

```html
<!-- 标准输入框 -->
<div class="form-group">
  <label class="form-label">手机号</label>
  <input type="tel" class="form-input" placeholder="请输入手机号">
</div>

<!-- 输入框+按钮组合 -->
<div class="input-group">
  <input type="text" class="form-input" placeholder="验证码">
  <button class="btn btn-secondary">获取验证码</button>
</div>
```

### 卡片组件

```html
<div class="card">
  <div class="card-header">
    <span class="card-title">卡片标题</span>
    <span style="color: #999;">查看全部 ›</span>
  </div>
  <div>卡片内容</div>
</div>
```

### 列表组件

```html
<div class="list">
  <div class="list-item">
    <div class="list-item-content">
      <p class="list-item-title">标题</p>
      <p class="list-item-desc">描述文字</p>
    </div>
    <span class="list-item-arrow">›</span>
  </div>
</div>
```

### 弹窗组件

```html
<div class="modal-overlay" id="modal-id">
  <div class="modal-content">
    <div class="modal-title">弹窗标题</div>
    <div class="modal-body">弹窗内容</div>
    <div class="modal-btns">
      <button class="btn btn-secondary">取消</button>
      <button class="btn btn-primary">确认</button>
    </div>
  </div>
</div>
```

### 底部导航

```html
<div class="tab-bar">
  <div class="tab-item active">
    <div class="tab-icon">🏠</div>
    <div class="tab-label">首页</div>
  </div>
  <div class="tab-item">
    <div class="tab-icon">📋</div>
    <div class="tab-label">订单</div>
  </div>
  <div class="tab-item">
    <div class="tab-icon">👤</div>
    <div class="tab-label">我的</div>
  </div>
</div>
```

## 样式规范速查

| 元素 | 圆角 | 间距 | 字体大小 |
|------|------|------|----------|
| 按钮 | 8px | 12px 24px | 16px |
| 输入框 | 8px | 12px 16px | 16px |
| 卡片 | 12px | 16px | 14-16px |
| 弹窗 | 16px | 24px | 18px |
| 头像/图标 | 50% / 12px | - | - |

## 质量检查清单

生成 HTML 原型后，必须逐项检查以下内容，确保原型可正常运行：

### 1. 页面切换机制
- [ ] CSS 中 `.phone-container` 默认 `display: none`
- [ ] CSS 中 `.phone-container.active` 设置 `display: block !important`
- [ ] CSS 中 `.hidden` 设置 `display: none !important`
- [ ] 默认显示的页面有 `class="phone-container active"`
- [ ] 其他页面有 `class="phone-container hidden"`
- [ ] `showPage` 函数同时操作 `active` 和 `hidden` 类
- [ ] **Safari 兼容**：使用 `!important` 确保 CSS 优先级

### 2. 多步骤流程显示（重要）
- [ ] 对于多步骤表单/流程，使用 `style="display:none;"` 代替 `class="hidden"`
- [ ] JavaScript 中使用 `element.style.display = 'none/block'` 而不是 `classList`
- [ ] 原因：内联 style 优先级高于 class，可避免 Safari 浏览器的 CSS 选择器优先级问题
- [ ] 示例：
```javascript
// ✅ 正确：使用 style.display
element.style.display = 'none';
element.style.display = 'block';

// ❌ 避免：依赖 class 切换（在 Safari 中可能有优先级问题）
element.classList.add('hidden');
element.classList.remove('hidden');
```

### 3. 元素 ID 唯一性
- [ ] 所有 `id` 属性值唯一，不重复
- [ ] 按钮和输入框的 `id` 与 JavaScript 事件绑定匹配

### 4. JavaScript 事件绑定
- [ ] 同一个元素的同一个事件只绑定一次
- [ ] 避免在 for 循环中为同一元素重复绑定事件
- [ ] 如果需要条件判断，在事件处理函数内部判断，而不是绑定多个事件
- [ ] 示例：
```javascript
// ✅ 正确：在事件处理函数内判断
button.addEventListener('click', function() {
  if (step === 7) {
    // 执行特殊逻辑
  } else {
    // 执行默认逻辑
  }
});

// ❌ 错误：重复绑定同一事件
button.addEventListener('click', handler1);
button.addEventListener('click', handler2); // 会导致 handler1 和 handler2 都执行
```

### 5. JavaScript 语法正确性
- [ ] `getElementById` 使用的 ID 存在于对应的 HTML 元素
- [ ] `addEventListener` 正确绑定，无拼写错误
- [ ] 函数调用参数与定义的函数签名匹配

### 6. 表单交互完整性
- [ ] 输入框有 `maxlength` 限制（如手机号11位、验证码6位）
- [ ] 禁用状态按钮的 `disabled` 属性正确设置
- [ ] 按钮状态变化（如登录按钮在输入合法后变为可点击）

### 7. 弹窗控制逻辑
- [ ] 弹窗默认 `class="modal-overlay hidden"` 或 `style="display:none;"`
- [ ] 显示弹窗：`style.display = 'flex'` 或 `classList.remove('hidden')`
- [ ] 隐藏弹窗：`style.display = 'none'` 或 `classList.add('hidden')`

### 8. Toast 提示
- [ ] `showToast` 函数在调用前检查是否已存在，如存在先移除
- [ ] Toast 有 2 秒后自动移除的定时器

### 9. 视觉一致性
- [ ] 按钮宽度统一（使用 `btn-block` 或固定宽度）
- [ ] 输入框和按钮组合使用 `input-group`
- [ ] 圆角、间距、颜色符合设计规范

### 10. 浏览器兼容性自检
- [ ] 在 Safari 浏览器中测试多步骤流程
- [ ] 测试页面跳转、弹窗、Toast 等交互功能
- [ ] 确保所有按钮点击事件正常工作

## 常见问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 点击按钮页面不跳转 | CSS 优先级问题 | 使用 `!important` 或内联 `style` |
| 多步骤流程后续步骤空白 | `classList` 在 Safari 中失效 | 使用 `style.display` |
| 按钮事件被执行多次 | 重复绑定事件 | 合并到单个事件处理函数 |
| 元素显示/隐藏状态异常 | CSS 选择器优先级冲突 | 确保 `active` 类有 `!important` |

## 注意事项

- 所有样式内联在 HTML 中，便于单文件分享
- 使用移动端优先设计，容器最大宽度 375px
- 交互逻辑使用原生 JavaScript，无依赖
- 统一使用设计规范中的颜色和间距
- 可直接在手机浏览器中预览效果
- 页面跳转通过显示/隐藏实现，无需服务器
