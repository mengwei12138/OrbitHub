/**
 * 「我的作品」面板与「全部作品」页的标题文案。
 *
 * 由 OpenSpec change `content-generation-my-works-data-isolation` 引入。
 * 普通管理员视角下卡片只展示自己的作品 → "我的作品"；
 * 租户管理员视角下卡片展示本租户全部普通管理员的作品 → "团队作品"。
 *
 * 注：当前 "团队作品" 为占位文案，最终以产品决策为准；改一处即可全局生效。
 */
export const MY_WORKS_TITLE_USER = '我的作品';
export const MY_WORKS_TITLE_TENANT = '团队作品';
