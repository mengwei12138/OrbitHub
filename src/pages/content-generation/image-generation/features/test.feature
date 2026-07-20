Feature: 图片生成测试

  Scenario: 生成中弹窗正确显示
    Given 用户已填写必填表单字段
    When 用户点击立即生成按钮
    Then 生成中弹窗应正确显示
    And 进度条应从0%开始

  Scenario: 生成完成后显示结果
    Given AI生成完成
    When 系统接收到生成完成事件
    Then 结果卡片应正确显示
    And 应显示标题、正文、标签
