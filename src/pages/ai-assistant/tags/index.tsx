import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, message } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomModal, PageHeader } from '@/components';
import {
  useCreateTag,
  useDisableTag,
  useEnableTag,
  useTagCategories,
  useTagStats,
  useUpdateTag,
} from '@/services/ai-assistant';

import CreateTagModal from './components/CreateTagModal';
import EditTagModal from './components/EditTagModal';
import TabTable from './components/TabTable';
import type { TagRecord } from './components/TabTable/types';
import TagOverview from './components/TagOverview';
import styles from './style.module.css';
import {
  normalizeTagNameForApi,
  platformUiToApi,
  type TagPlatformUi,
} from './utils/mapTag';

const TagsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, messageHolder] = message.useMessage();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TagRecord | undefined>();

  const statsQuery = useTagStats();
  const categoriesQuery = useTagCategories();

  const overviewLoading = statsQuery.isLoading;

  const overviewStats = useMemo(() => {
    const byCode: Record<string, number> = {};
    for (const c of statsQuery.data?.categories ?? []) {
      byCode[c.code] = c.count;
    }
    return {
      hot: byCode.hot ?? 0,
      content: byCode.content ?? 0,
      emotion: byCode.emotion ?? 0,
      disabled: statsQuery.data?.disabled ?? 0,
    };
  }, [statsQuery.data]);

  const categoryOptions = categoriesQuery.data?.categories ?? [];

  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const disableMutation = useDisableTag();
  const enableMutation = useEnableTag();

  const invalidateTagQueries = () =>
    void queryClient.invalidateQueries({
      queryKey: ['ai-assistant', 'tags'],
    });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (values: Record<string, unknown>) => {
    const category = ((values.category as string) ?? '').trim();
    const rawName = (values.tagName as string) ?? '';
    if (!category) {
      messageApi.warning('请选择或填写分类');
      throw new Error('validation');
    }
    if (!rawName.trim()) {
      messageApi.warning('请输入标签名称');
      throw new Error('validation');
    }
    const name = normalizeTagNameForApi(rawName);
    await createMutation.mutateAsync({
      category,
      name,
      applicablePlatform: platformUiToApi(values.platform as TagPlatformUi),
    });
    messageApi.success('标签已创建');
    invalidateTagQueries();
    setCreateModalOpen(false);
  };

  const handleEdit = (record: TagRecord) => {
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: Record<string, unknown>) => {
    if (!editRecord) {
      throw new Error('validation');
    }
    const category = ((values.category as string) ?? '').trim();
    const rawName = (values.tagName as string) ?? '';
    if (!category) {
      messageApi.warning('请选择或填写分类');
      throw new Error('validation');
    }
    if (!rawName.trim()) {
      messageApi.warning('请输入标签名称');
      throw new Error('validation');
    }
    const name = normalizeTagNameForApi(rawName);
    await updateMutation.mutateAsync({
      tagId: editRecord.id,
      data: {
        category,
        name,
        applicablePlatform: platformUiToApi(values.platform as TagPlatformUi),
      },
    });
    messageApi.success('标签已更新');
    invalidateTagQueries();
    setEditModalOpen(false);
    setEditRecord(undefined);
  };

  const handleDisable = (record: TagRecord) => {
    CustomModal.confirm({
      title: '确认停用',
      content: (
        <div>
          <div>确实停用该标签吗？</div>
          <div style={{ marginTop: 8 }}>
            停用后该标签不会出现在内容发布的标签建议中，已使用过的内容不受影响。可随时重新启用。
          </div>
        </div>
      ),
      okText: '确认停用',
      cancelText: '取消',
      onOk: () => {
        disableMutation.mutate(record.id, {
          onSuccess: () => {
            messageApi.success('已停用');
            invalidateTagQueries();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '停用失败'),
        });
      },
    });
  };

  const handleEnable = (record: TagRecord) => {
    enableMutation.mutate(record.id, {
      onSuccess: () => {
        messageApi.success('已启用');
        invalidateTagQueries();
      },
      onError: (e) =>
        messageApi.error(e instanceof Error ? e.message : '启用失败'),
    });
  };

  return (
    <>
      {messageHolder}
      <PageHeader
        title="标签库"
        toolbar={
          <div className={styles.toolbar}>
            <Button onClick={handleCreate}>+ 新建标签</Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                navigate('/ai-assistant');
              }}
            >
              返回
            </Button>
          </div>
        }
      />
      <div className={styles.container}>
        <TagOverview stats={overviewStats} loading={overviewLoading} />
        <TabTable
          categoryOptions={categoryOptions}
          onEdit={handleEdit}
          onDisable={handleDisable}
          onEnable={handleEnable}
        />
      </div>
      <CreateTagModal
        open={createModalOpen}
        submitLoading={createMutation.isPending}
        categoryOptions={categoryOptions}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      <EditTagModal
        key={editRecord?.id ?? 'closed'}
        open={editModalOpen}
        record={editRecord}
        submitLoading={updateMutation.isPending}
        categoryOptions={categoryOptions}
        onClose={() => {
          setEditModalOpen(false);
          setEditRecord(undefined);
        }}
        onSubmit={handleEditSubmit}
      />
    </>
  );
};

export default TagsPage;
