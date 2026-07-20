import { ProFormText } from '@ant-design/pro-components';
import { message, Select } from 'antd';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { CustomModal } from '@/components';
import styles from './style.module.css';
import type { CreateTagModalProps } from './types';

const PLATFORM_OPTIONS = [
  { label: '全部', value: 'ALL' },
  { label: '仅抖音', value: 'DOUYIN' },
  { label: '仅小红书', value: 'XIAOHONGSHU' },
];

const PLATFORM_LIMITS: Record<string, string | null> = {
  ALL: null,
  DOUYIN: '抖音最多5个标签',
  XIAOHONGSHU: '小红书最多10个标签',
};

const SPECIAL_CHAR_PATTERN = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/u;

const isPureNumber = (value: string): boolean => {
  return /^\d+$/u.test(value);
};

const CreateTagModal: FC<CreateTagModalProps> = ({
  open,
  submitLoading,
  categoryOptions,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<
    'ALL' | 'DOUYIN' | 'XIAOHONGSHU'
  >('ALL');
  const categorySelectRef = useRef<any>(null);

  const handleCategoryChange = (value: string) => {
    const isPreset = categoryOptions.some((opt) => opt.name === value);
    if (isPreset) {
      setCategory(value);
      setCustomCategory('');
    } else if (value) {
      setCategory('');
      setCustomCategory(value);
    }
  };

  const handleCategorySearch = (value: string) => {
    const isPreset = categoryOptions.some((opt) => opt.name === value);
    if (!isPreset && value.trim()) {
      setCustomCategory(value.trim());
    }
  };

  const handlePlatformChange = (value: 'ALL' | 'DOUYIN' | 'XIAOHONGSHU') => {
    setSelectedPlatform(value);
  };

  const handleFinish = async (values: Record<string, unknown>) => {
    const tagName = (values.tagName as string)?.trim();
    if (!tagName) {
      message.error('请输入标签名称');
      return false;
    }
    try {
      const finalCategory = customCategory || category;
      if (!finalCategory) {
        message.error('请选择或填写分类');
        return false;
      }
      await onSubmit({
        category: finalCategory,
        platform: selectedPlatform,
        tagName: tagName,
      });
      return true;
    } catch (e) {
      if (e instanceof Error && e.message === 'validation') {
        return false;
      }
      message.error(e instanceof Error ? e.message : '创建标签失败，请重试');
      return false;
    }
  };

  const handleOpenChange = (visible: boolean) => {
    if (!visible) {
      onClose();
      setCategory('');
      setCustomCategory('');
      setSelectedPlatform('ALL');
    }
  };

  const selectOptions = categoryOptions.map((opt) => ({
    label: opt.name,
    value: opt.name,
  }));

  return (
    <CustomModal
      title="新建标签"
      open={open}
      onOpenChange={handleOpenChange}
      onFinish={handleFinish}
      modalProps={{ maskClosable: false }}
      submitter={{
        submitButtonProps: { loading: submitLoading },
      }}
      width={560}
    >
      <div className={styles.formItem}>
        <div className={styles.label}>
          <span className={styles.required}>*</span>
          分类
        </div>
        <div className={styles.categoryRow}>
          <Select
            ref={categorySelectRef}
            className={styles.categorySelect}
            value={customCategory || category}
            onChange={handleCategoryChange}
            onSearch={handleCategorySearch}
            options={selectOptions}
            placeholder="选择或输入分类"
            showSearch
            filterOption={false}
            allowClear
          />
          <button
            type="button"
            className={styles.customBtn}
            onClick={() => categorySelectRef.current?.focus()}
          >
            + 自定义
          </button>
        </div>
      </div>

      <div className={styles.formItem}>
        <div className={styles.label}>
          <span className={styles.required}>*</span>
          适用平台
        </div>
        <div className={styles.platformWrapper}>
          {PLATFORM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.platformBtn} ${selectedPlatform === option.value ? styles.active : ''}`}
              onClick={() =>
                handlePlatformChange(
                  option.value as 'ALL' | 'DOUYIN' | 'XIAOHONGSHU',
                )
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        {selectedPlatform !== 'ALL' && (
          <div className={styles.platformTip}>
            {PLATFORM_LIMITS[selectedPlatform]}
          </div>
        )}
      </div>

      <ProFormText
        name="tagName"
        label="标签名称"
        placeholder="输入标签名称"
        rules={[
          { required: true, message: '请输入标签名称' },
          {
            pattern: SPECIAL_CHAR_PATTERN,
            message: '禁止特殊符号',
          },
          {
            validator: (_, value: string) => {
              if (value && isPureNumber(value)) {
                return Promise.reject(new Error('不支持纯数字'));
              }
              return Promise.resolve();
            },
          },
          { max: 29, message: '最多30字符（含#）' },
        ]}
        fieldProps={{
          maxLength: 29,
          prefix: '#',
        }}
      />

      <div className={styles.helpBox}>
        <div className={styles.helpTitle}>命名规范</div>
        <div className={styles.helpContent}>
          <div>• 标签以 # 开头，最多 30 字符，不支持纯数字</div>
          <div>• 抖音单次发布最多 5 个标签，小红书最多 10 个</div>
        </div>
      </div>
    </CustomModal>
  );
};

export default CreateTagModal;
