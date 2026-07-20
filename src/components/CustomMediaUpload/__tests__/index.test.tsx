import { render, screen } from '@testing-library/react';
import { message } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import CustomMediaUpload from '../index';
import type { UploadController } from '../types';

const mockUploadController: UploadController = {
  createSession: vi.fn().mockResolvedValue({
    uploadSessionId: 'session-123',
    partSizeBytes: '5',
    totalParts: 3,
    maxConcurrentParts: 2,
  }),
  uploadPart: vi.fn().mockResolvedValue({
    partNumber: 1,
    receivedSizeBytes: '5',
    serverPartEtag: 'etag-1',
  }),
  getSessionStatus: vi.fn().mockResolvedValue({
    uploadSessionId: 'session-123',
    status: 'UPLOADING',
    partSizeBytes: '5',
    totalParts: 3,
    fileSizeBytes: '15',
    uploadedParts: [],
    missingPartNumbers: [1, 2, 3],
    expiresAt: '2026-04-24T12:00:00Z',
  }),
  cancelSession: vi.fn().mockResolvedValue(undefined),
  completeSession: vi.fn().mockResolvedValue({
    mediaAssetId: 'media-123',
    fileSizeBytes: '15',
    previewUrl: '/api/v1/media/media-123/preview',
    mimeType: 'text/plain',
  }),
};

describe('CustomMediaUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(message, 'error').mockClear();
  });

  describe('渲染', () => {
    it('应正确渲染 Upload 组件', () => {
      render(<CustomMediaUpload uploadController={mockUploadController} />);

      expect(document.querySelector('.ant-upload-wrapper')).toBeTruthy();
    });

    it('dragger 为 true 时应渲染 Dragger 变体', () => {
      render(
        <CustomMediaUpload uploadController={mockUploadController} dragger />,
      );

      expect(document.querySelector('.ant-upload-drag')).toBeTruthy();
    });

    it('应透传 antd Upload 的基础 props', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="video/*"
          multiple
          maxCount={5}
        />,
      );

      const upload = document.querySelector('.ant-upload');
      expect(upload).toBeTruthy();
    });

    it('disabled 为 true 时应禁用上传', () => {
      render(
        <CustomMediaUpload uploadController={mockUploadController} disabled />,
      );

      expect(document.querySelector('.ant-upload-disabled')).toBeTruthy();
    });

    it('className 应正确传递', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          className="custom-upload"
        />,
      );

      const container = document.querySelector('.custom-upload');
      expect(container).toBeTruthy();
    });
  });

  describe('children', () => {
    it('应正确渲染 children', () => {
      render(
        <CustomMediaUpload uploadController={mockUploadController}>
          <span data-testid="custom-child">上传文件</span>
        </CustomMediaUpload>,
      );

      expect(screen.getByTestId('custom-child')).toBeTruthy();
    });
  });

  describe('accept 属性', () => {
    it('应接受 accept="image/*" 并渲染上传组件', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="image/*"
        >
          <span>上传图片</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });

    it('应接受 accept=".jpg,.png,.webp" 并渲染上传组件', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept=".jpg,.png,.webp"
        >
          <span>上传图片</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });

    it('应接受 accept="video/mp4,video/quicktime" 并渲染上传组件', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="video/mp4,video/quicktime"
        >
          <span>上传视频</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });
  });

  describe('maxFileSize 属性', () => {
    it('maxFileSize={200} 时应渲染上传组件', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          maxFileSize={200}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });

    it('maxFileSize={500} 时应渲染上传组件', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          maxFileSize={500}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });

    it('maxFileSize=0.5MB 时应拦截大于 0.5MB 的文件', async () => {
      const handleFileSizeError = vi.fn();
      const mockFile = new File(['a'.repeat(1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });

      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          maxFileSize={0.5}
          onFileSizeError={handleFileSizeError}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      const upload = document.querySelector('.ant-upload');
      expect(upload).toBeTruthy();

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input });
      input.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(handleFileSizeError).toHaveBeenCalledWith(mockFile);
      });
    });
  });

  describe('onFileTypeError 回调', () => {
    it('onFileTypeError 为 undefined 时 message.error 未被调用', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="image/*"
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(message.error).not.toHaveBeenCalled();
    });

    it('提供 onFileTypeError 回调时应渲染组件', () => {
      const handleFileTypeError = vi.fn();
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="image/*"
          onFileTypeError={handleFileTypeError}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
      expect(handleFileTypeError).not.toHaveBeenCalled();
    });
  });

  describe('onFileSizeError 回调', () => {
    it('onFileSizeError 为 undefined 时 message.error 未被调用', () => {
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          maxFileSize={200}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(message.error).not.toHaveBeenCalled();
    });

    it('提供 onFileSizeError 回调时应渲染组件', () => {
      const handleFileSizeError = vi.fn();
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          maxFileSize={200}
          onFileSizeError={handleFileSizeError}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
      expect(handleFileSizeError).not.toHaveBeenCalled();
    });
  });

  describe('beforeUpload 合并', () => {
    it('提供自定义 beforeUpload 时应渲染组件', () => {
      const customBeforeUpload = vi.fn().mockReturnValue(true);
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          beforeUpload={customBeforeUpload}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });

    it('accept 和 beforeUpload 同时使用时应渲染组件', () => {
      const customBeforeUpload = vi.fn().mockReturnValue(true);
      render(
        <CustomMediaUpload
          uploadController={mockUploadController}
          accept="image/*"
          beforeUpload={customBeforeUpload}
        >
          <span>上传</span>
        </CustomMediaUpload>,
      );

      expect(document.querySelector('.ant-upload')).toBeTruthy();
    });
  });
});
