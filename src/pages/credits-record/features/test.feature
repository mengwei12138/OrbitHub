Feature: 积分使用记录测试

  Scenario: 查看积分使用记录
    Given 用户进入积分使用记录页面
    When 用户点击查询按钮
    Then 系统展示积分使用记录
