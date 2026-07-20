import { describe, expect, it, vi } from 'vitest';

import {
  accountCommentReplySettingsQueryOptions,
  addBlockedKeyword,
  applyOptimization,
  blockedKeywordsQueryOptions,
  commentFetchTargetsQueryOptions,
  commentReplyAccountsQueryOptions,
  commentReplyHistoryQueryOptions,
  commentReplyRulesQueryOptions,
  commentReplyTodayDashboardQueryOptions,
  createTag,
  createTagCategory,
  deleteBlockedKeyword,
  deleteComment,
  disableTag,
  enableTag,
  homeSummaryQueryOptions,
  humanClassifyComment,
  humanReviewCommentsQueryOptions,
  lowDataContentsQueryOptions,
  markMessageImportant,
  optimizeContent,
  optimizeThresholdQueryOptions,
  pendingCommentsQueryOptions,
  republishTaskQueryOptions,
  submitManualCommentReply,
  submitManualMessageReply,
  submitRepublish,
  tagCategoriesQueryOptions,
  tagsQueryOptions,
  triggerCommentAutoReply,
  triggerCommentScrape,
  triggerMessageAutoReply,
  triggerMessageScrape,
  updateAccountCommentReplySettings,
  updateMessageScrapeSettings,
  updateOptimizeThreshold,
  updateTag,
  upsertCommentReplyRules,
  upsertMessageCategories,
  upsertMessageReplyRules,
} from '../queryOptions';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const getReq = async () => (await import('@/api/request')).default;
const okGet = (data: unknown) => async () => {
  const r = await getReq();
  (r.get as ReturnType<typeof vi.fn>).mockResolvedValue(data);
};
const okPost =
  (data: unknown = null) =>
  async () => {
    const r = await getReq();
    (r.post as ReturnType<typeof vi.fn>).mockResolvedValue(data);
  };
const okPut =
  (data: unknown = null) =>
  async () => {
    const r = await getReq();
    (r.put as ReturnType<typeof vi.fn>).mockResolvedValue(data);
  };
const okDelete =
  (data: unknown = null) =>
  async () => {
    const r = await getReq();
    (r.delete as ReturnType<typeof vi.fn>).mockResolvedValue(data);
  };

describe('ai-assistant queryOptions', () => {
  describe('homeSummaryQueryOptions', () => {
    it('queryKey 与路径正确', async () => {
      const opt = homeSummaryQueryOptions();
      expect(opt.queryKey).toEqual(['ai-assistant', 'home', 'summary']);
      await okGet({ features: [] })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith('/api/v1/ai-assistant/home/summary');
    });
  });

  describe('commentFetchTargetsQueryOptions', () => {
    it('携带 phoneNumber/platform 调用内部接口', async () => {
      const params = {
        phoneNumber: '13800000000',
        platform: 'douyin' as const,
      };
      const opt = commentFetchTargetsQueryOptions(params);
      expect(opt.queryKey).toEqual([
        'ai-assistant',
        'comment-internal',
        'fetch-targets',
        params,
      ]);
      await okGet({ targets: [] })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/internal/comment-targets',
        { params },
      );
    });
  });

  describe('comment-reply 读侧', () => {
    it('today dashboard', async () => {
      const opt = commentReplyTodayDashboardQueryOptions();
      expect(opt.queryKey).toEqual([
        'ai-assistant',
        'comment-reply',
        'dashboard',
        'today',
      ]);
      await okGet({
        autoReplyCount: 0,
        blockedCount: 0,
        humanReviewCount: 0,
      })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/dashboard/today',
      );
    });

    it('accounts', async () => {
      const params = { page: 1, pageSize: 5 };
      const opt = commentReplyAccountsQueryOptions(params);
      expect(opt.queryKey).toEqual([
        'ai-assistant',
        'comment-reply',
        'accounts',
        params,
      ]);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/accounts',
        { params },
      );
    });

    it('pending', async () => {
      const params = { page: 1, pageSize: 10 };
      const opt = pendingCommentsQueryOptions(params);
      expect(opt.queryKey[3]).toEqual(params);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/pending',
        { params },
      );
    });

    it('human-review', async () => {
      const params = {
        page: 1,
        pageSize: 10,
        reason: 'LOW_CONFIDENCE' as const,
      };
      const opt = humanReviewCommentsQueryOptions(params);
      expect(opt.queryKey[3]).toEqual(params);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/human-review',
        { params },
      );
    });

    it('history', async () => {
      const params = { page: 1, pageSize: 10 };
      const opt = commentReplyHistoryQueryOptions(params);
      expect(opt.queryKey[3]).toEqual(params);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/history',
        { params },
      );
    });
  });

  describe('comment-reply 配置 CRUD', () => {
    it('blocked-keywords list/add/delete', async () => {
      const opt = blockedKeywordsQueryOptions();
      await okGet({ keywords: [] })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/blocked-keywords',
      );

      await okPost()();
      await addBlockedKeyword({ keyword: '广告' });
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/blocked-keywords',
        { keyword: '广告' },
      );

      await okDelete()();
      await deleteBlockedKeyword('100');
      expect(r.delete).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/blocked-keywords/100',
      );
    });

    it('rules get/upsert', async () => {
      const opt = commentReplyRulesQueryOptions();
      await okGet({ rules: [] })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/rules',
      );

      await okPut()();
      await upsertCommentReplyRules({ rules: [] });
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/rules',
        { rules: [] },
      );
    });

    it('account-settings get/put 含 accountId', async () => {
      const opt = accountCommentReplySettingsQueryOptions('123');
      expect(opt.queryKey).toEqual([
        'ai-assistant',
        'comment-reply',
        'account-settings',
        '123',
      ]);
      await okGet({
        accountId: '123',
        autoReplyEnabled: true,
        scrapeIntervalSeconds: 300,
      })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/account-settings/123',
      );

      await okPut()();
      await updateAccountCommentReplySettings('123', {
        autoReplyEnabled: false,
      });
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/account-settings/123',
        { autoReplyEnabled: false },
      );
    });
  });

  describe('comment-reply 写操作', () => {
    it('triggerCommentScrape', async () => {
      await okPost({ batchId: 'b1', callbackId: 'c1', status: 'ACCEPTED' })();
      await triggerCommentScrape({ accountId: '1' });
      const r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/scrape',
        { accountId: '1' },
      );
    });
    it('triggerCommentAutoReply', async () => {
      await okPost()();
      await triggerCommentAutoReply('99');
      const r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/99/auto-reply',
      );
    });
    it('submitManualCommentReply', async () => {
      await okPost()();
      await submitManualCommentReply('99', { replyText: 'thanks' });
      const r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/99/reply',
        { replyText: 'thanks' },
      );
    });
    it('deleteComment', async () => {
      await okDelete()();
      await deleteComment('99');
      const r = await getReq();
      expect(r.delete).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/99',
      );
    });
    it('humanClassifyComment', async () => {
      await okPost()();
      await humanClassifyComment('99', { category: 'positive' });
      const r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/comment-reply/human-review/99/classify',
        { category: 'positive' },
      );
    });
  });

  describe('content-optimize', () => {
    it('threshold get/put', async () => {
      const opt = optimizeThresholdQueryOptions();
      await okGet({ viewMin: 500, likeRateMinPercent: 2 })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/content-optimize/threshold',
      );
      await okPut()();
      await updateOptimizeThreshold({ viewMin: 500, likeRateMinPercent: 2 });
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/content-optimize/threshold',
        { viewMin: 500, likeRateMinPercent: 2 },
      );
    });
    it('low-data 列表', async () => {
      const params = { page: 1, pageSize: 10 };
      const opt = lowDataContentsQueryOptions(params);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/content-optimize/low-data',
        { params },
      );
    });
    it('optimize/apply/republish', async () => {
      await okPost()();
      await optimizeContent('1');
      let r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/content-optimize/1/optimize',
      );
      await applyOptimization('1', { title: 't' });
      r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/content-optimize/1/apply',
        { title: 't' },
      );
      await okPost({ taskId: '7' })();
      const res = await submitRepublish({
        contentId: '1',
        targetAccountIds: ['1'],
        deleteOriginal: false,
      });
      expect(res.taskId).toBe('7');
    });
    it('republish 任务轮询：终态停止', () => {
      const opt = republishTaskQueryOptions('7');
      const interval = opt.refetchInterval as (q: {
        state: { data?: { status: string } };
      }) => false | number;
      expect(interval({ state: { data: { status: 'PENDING' } } })).toBe(3000);
      expect(interval({ state: { data: { status: 'SUCCESS' } } })).toBe(false);
    });
  });

  describe('tags', () => {
    it('list/create/update/disable/enable', async () => {
      const params = { page: 1, pageSize: 10 };
      const opt = tagsQueryOptions(params);
      await okGet({ list: [], total: '0' })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith('/api/v1/ai-assistant/tags', {
        params,
      });
      await okPost({
        tagId: '1',
        name: '#x',
        applicablePlatform: 'all',
        status: 'enabled',
      })();
      await createTag({ category: 'c', name: '#x', applicablePlatform: 'all' });
      expect(r.post).toHaveBeenCalledWith('/api/v1/ai-assistant/tags', {
        category: 'c',
        name: '#x',
        applicablePlatform: 'all',
      });
      await okPut()();
      await updateTag('1', { name: '#y' });
      expect(r.put).toHaveBeenCalledWith('/api/v1/ai-assistant/tags/1', {
        name: '#y',
      });
      await okPost()();
      await disableTag('1');
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/tags/1/disable',
      );
      await enableTag('1');
      expect(r.post).toHaveBeenCalledWith('/api/v1/ai-assistant/tags/1/enable');
    });

    it('categories list/create', async () => {
      const opt = tagCategoriesQueryOptions();
      await okGet({ categories: [] })();
      await opt.queryFn();
      const r = await getReq();
      expect(r.get).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/tags/categories',
      );
      await okPost()();
      await createTagCategory({ name: '热门' });
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/tags/categories',
        { name: '热门' },
      );
    });
  });

  describe('message-reply（本期 501，验证路径）', () => {
    it('scrape-settings put', async () => {
      await okPut()();
      await updateMessageScrapeSettings({ scrapeIntervalSeconds: 300 });
      const r = await getReq();
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/scrape-settings',
        { scrapeIntervalSeconds: 300 },
      );
    });
    it('scrape post', async () => {
      await okPost()();
      await triggerMessageScrape({ accountId: '1' });
      const r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/scrape',
        { accountId: '1' },
      );
    });
    it('categories put', async () => {
      await okPut()();
      await upsertMessageCategories({ categories: [] });
      const r = await getReq();
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/categories',
        { categories: [] },
      );
    });
    it('rules put', async () => {
      await okPut()();
      await upsertMessageReplyRules({ rules: [] });
      const r = await getReq();
      expect(r.put).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/rules',
        { rules: [] },
      );
    });
    it('reply / auto-reply / mark-important', async () => {
      await okPost()();
      await submitManualMessageReply('1', { replyText: 'ok' });
      let r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/1/reply',
        { replyText: 'ok' },
      );
      await triggerMessageAutoReply('1');
      r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/1/auto-reply',
      );
      await markMessageImportant('1');
      r = await getReq();
      expect(r.post).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/message-reply/1/mark-important',
      );
    });
  });
});
