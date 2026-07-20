import { fireEvent, render, screen } from '@testing-library/react';
import type { UploadChangeParam } from 'antd/es/upload/interface';
import { describe, expect, it, vi } from 'vitest';
import ImageUpload from '../index';
import type { ImageUploadFile, ImageUploadProps } from '../types';

const { pendingChangeArg } = vi.hoisted(() => {
  const initial: UploadChangeParam = {
    file: {
      uid: '-1',
      name: '',
      status: 'uploading',
    },
    fileList: [],
  };
  return { pendingChangeArg: { current: initial } };
});

vi.mock('@/components/CustomMediaUpload', () => ({
  default: vi.fn(({ children, onChange }) => (
    <div
      data-testid="custom-upload"
      onClick={() => onChange?.(pendingChangeArg.current)}
    >
      {children}
    </div>
  )),
}));

const createMockController = () => ({
  createSession: vi.fn(),
  uploadPart: vi.fn(),
  getSessionStatus: vi.fn(),
  cancelSession: vi.fn(),
  completeSession: vi.fn(),
});

const mockFile: ImageUploadFile = {
  uid: '1',
  name: 'test-image.jpg',
  lastModified: 1234567890,
  size: 1024,
  type: 'image/jpeg',
  status: 'done',
  url: 'https://example.com/image.jpg',
  thumbUrl: 'https://example.com/thumb.jpg',
};

describe('ImageUpload 组件', () => {
  describe('无上传项状态', () => {
    it('当 value 为空时渲染空状态', () => {
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
      };

      render(<ImageUpload {...props} />);

      expect(screen.getByText('点击或拖拽上传图片')).toBeInTheDocument();
      expect(
        screen.getByText('支持 JPG/PNG/WEBP，单张最大200MB，最多100张'),
      ).toBeInTheDocument();
    });
  });

  describe('有上传项状态', () => {
    it('当有上传文件时渲染已上传视图', () => {
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [mockFile],
        onChange: vi.fn(),
        maxCount: 100,
        maxFileSize: 200,
      };

      render(<ImageUpload {...props} />);

      expect(
        screen.getByText('已上传 1 张图片（可继续添加）'),
      ).toBeInTheDocument();
      expect(screen.getByText('继续上传')).toBeInTheDocument();
    });

    it('删除所有上传项后恢复无上传项状态', () => {
      const onChange = vi.fn();
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [mockFile],
        onChange,
        maxCount: 100,
        maxFileSize: 200,
      };

      render(<ImageUpload {...props} />);

      const deleteBtn = screen.getByTitle('删除');
      fireEvent.click(deleteBtn);

      // 函数式 setState：调用方收到 (prev) => prev.filter(...)，
      // 用当前 value 跑一遍验证结果为空数组
      expect(onChange).toHaveBeenCalledTimes(1);
      const updater = onChange.mock.calls[0][0];
      expect(typeof updater).toBe('function');
      expect(updater([mockFile])).toEqual([]);
    });
  });

  describe('上传进度', () => {
    it('上传中的文件显示进度条', () => {
      const uploadingFile: ImageUploadFile = {
        ...mockFile,
        uid: '2',
        status: 'uploading',
        percent: 50,
      };

      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [uploadingFile],
        onChange: vi.fn(),
        maxCount: 100,
        maxFileSize: 200,
      };

      render(<ImageUpload {...props} />);

      expect(
        screen.getByText('已上传 1 张图片（可继续添加）'),
      ).toBeInTheDocument();
    });
  });

  describe('UploadCompleteData 合并', () => {
    it('done 状态时应把 previewUrl 合并到 file.url，且写入 mediaAssetId 等元数据', () => {
      const uploadCompleteResponse = {
        mediaAssetId: 'media-abc',
        fileSizeBytes: '204800',
        previewUrl: '/api/v1/content/media/media-abc/preview',
        mimeType: 'image/jpeg',
        widthPx: 1080,
        heightPx: 1920,
        ratio: '9:16',
        probeError: null,
      };

      pendingChangeArg.current = {
        file: {
          uid: 'new-uid',
          name: 'x.jpg',
          lastModified: 111,
          size: 204800,
          type: 'image/jpeg',
          status: 'done',
          thumbUrl: undefined,
          response: uploadCompleteResponse,
        },
        fileList: [],
      };

      const onChange = vi.fn();
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange,
        maxCount: 100,
        maxFileSize: 200,
      };

      render(<ImageUpload {...props} />);

      fireEvent.click(screen.getByTestId('custom-upload'));

      expect(onChange).toHaveBeenCalled();
      const [lastCall] = onChange.mock.calls.slice(-1);
      const arg = lastCall?.[0];
      if (typeof arg === 'function') {
        const result = arg([]);
        expect(result).toHaveLength(1);
        const merged = result[0];
        expect(merged.status).toBe('done');
        expect(merged.url).toBe('/api/v1/content/media/media-abc/preview');
        expect(merged.mediaAssetId).toBe('media-abc');
        expect(merged.mimeType).toBe('image/jpeg');
        expect(merged.widthPx).toBe(1080);
        expect(merged.ratio).toBe('9:16');
      } else {
        expect(Array.isArray(arg)).toBe(true);
        const merged = arg[0];
        expect(merged.status).toBe('done');
        expect(merged.url).toBe('/api/v1/content/media/media-abc/preview');
        expect(merged.mediaAssetId).toBe('media-abc');
        expect(merged.mimeType).toBe('image/jpeg');
        expect(merged.widthPx).toBe(1080);
        expect(merged.ratio).toBe('9:16');
      }
    });
  });

  describe('并发上传不丢文件（函数式 setState 修复）', () => {
    it('两个文件并发触发 onChange，functional updates 串行合并后两者都在', () => {
      // 模拟用户一次选 2 张图。antd Upload 会针对每个文件分别触发 onChange，
      // 两次回调在 setState 异步前都看到 value=[]。
      const onChange = vi.fn();
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange,
        maxCount: 100,
        maxFileSize: 200,
      };
      render(<ImageUpload {...props} />);

      pendingChangeArg.current = {
        file: {
          uid: 'file-A',
          name: 'a.jpg',
          status: 'done',
          response: { mediaAssetId: 'asset-A', previewUrl: '/p/A' },
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      pendingChangeArg.current = {
        file: {
          uid: 'file-B',
          name: 'b.jpg',
          status: 'done',
          response: { mediaAssetId: 'asset-B', previewUrl: '/p/B' },
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      expect(onChange).toHaveBeenCalledTimes(2);
      // 串行 reduce 两个 updater：A 先入列，B 应该叠加上去而不是覆盖 A。
      const updaters = onChange.mock.calls.map((c) => c[0]);
      const finalList = updaters.reduce<ImageUploadFile[]>(
        (acc, fn) => (typeof fn === 'function' ? fn(acc) : fn),
        [],
      );
      expect(finalList).toHaveLength(2);
      expect(finalList.map((f) => f.uid)).toEqual(['file-A', 'file-B']);
      expect(finalList.map((f) => f.mediaAssetId)).toEqual([
        'asset-A',
        'asset-B',
      ]);
    });

    it('迟到的 uploading 进度事件不能把已 done 的文件回退', () => {
      const onChange = vi.fn();
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange,
        maxCount: 100,
        maxFileSize: 200,
      };
      render(<ImageUpload {...props} />);

      // 第一次：done
      pendingChangeArg.current = {
        file: {
          uid: 'file-A',
          name: 'a.jpg',
          status: 'done',
          response: { mediaAssetId: 'asset-A', previewUrl: '/p/A' },
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      // 第二次：迟到的 uploading 50% 进度
      pendingChangeArg.current = {
        file: {
          uid: 'file-A',
          name: 'a.jpg',
          status: 'uploading',
          percent: 50,
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      const updaters = onChange.mock.calls.map((c) => c[0]);
      const finalList = updaters.reduce<ImageUploadFile[]>(
        (acc, fn) => (typeof fn === 'function' ? fn(acc) : fn),
        [],
      );
      expect(finalList).toHaveLength(1);
      expect(finalList[0].status).toBe('done');
      expect(finalList[0].mediaAssetId).toBe('asset-A');
    });

    it('迟到的 error 事件不能把已 done 的文件打回失败', () => {
      const onChange = vi.fn();
      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange,
        maxCount: 100,
        maxFileSize: 200,
      };
      render(<ImageUpload {...props} />);

      pendingChangeArg.current = {
        file: {
          uid: 'file-A',
          name: 'a.jpg',
          status: 'done',
          response: { mediaAssetId: 'asset-A', previewUrl: '/p/A' },
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      pendingChangeArg.current = {
        file: {
          uid: 'file-A',
          name: 'a.jpg',
          status: 'error',
        } as ImageUploadFile,
        fileList: [],
      };
      fireEvent.click(screen.getByTestId('custom-upload'));

      const updaters = onChange.mock.calls.map((c) => c[0]);
      const finalList = updaters.reduce<ImageUploadFile[]>(
        (acc, fn) => (typeof fn === 'function' ? fn(acc) : fn),
        [],
      );
      expect(finalList[0].status).toBe('done');
    });
  });

  describe('maxCount 限制', () => {
    it('达到最大数量时不显示继续上传按钮', () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        ...mockFile,
        uid: String(i),
      }));

      const props: ImageUploadProps = {
        uploadController: createMockController(),
        value: files,
        onChange: vi.fn(),
        maxCount: 10,
      };

      render(<ImageUpload {...props} />);

      const continueBtn = screen.getByRole('button', { name: '继续上传' });
      expect(continueBtn).toBeDisabled();
      expect(screen.getByText('已上传 10 张图片')).toBeInTheDocument();
    });
  });
});
