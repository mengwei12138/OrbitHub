import { act, fireEvent, render, screen } from '@testing-library/react';
import type { RcFile, UploadChangeParam } from 'antd/es/upload/interface';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VideoUpload from '../index';
import type { VideoUploadFile, VideoUploadProps } from '../types';

const mockVideoDurationValue = { value: 600 };
const mockVideoWidthValue = { value: 1080 };
const mockVideoHeightValue = { value: 1920 };

const originalCreateElement = document.createElement.bind(document);

vi.stubGlobal('URL', {
  createObjectURL: vi.fn((_file: File) => 'blob:mock-video-url'),
  revokeObjectURL: vi.fn(),
});

const createMockVideoElement = () => {
  const video = {
    _src: '',
    _preload: '',
    onloadedmetadata: null as ((...args: unknown[]) => void) | null,
    onerror: null as ((...args: unknown[]) => void) | null,
    get src() {
      return this._src;
    },
    set src(value: string) {
      this._src = value;
      setTimeout(() => {
        this.onloadedmetadata?.();
      }, 0);
    },
    get preload() {
      return this._preload;
    },
    set preload(value: string) {
      this._preload = value;
    },
    get duration() {
      return mockVideoDurationValue.value;
    },
    get videoWidth() {
      return mockVideoWidthValue.value;
    },
    get videoHeight() {
      return mockVideoHeightValue.value;
    },
  };
  return video;
};

let mockVideoElement = createMockVideoElement();

vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'video') {
    mockVideoElement = createMockVideoElement();
    return mockVideoElement as unknown as HTMLVideoElement;
  }
  return originalCreateElement(tagName);
});

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

let capturedBeforeUpload: ((file: RcFile) => Promise<boolean>) | undefined;

vi.mock('@/components/CustomMediaUpload', () => ({
  default: vi.fn(({ children, onChange, beforeUpload }) => {
    capturedBeforeUpload = beforeUpload;
    return (
      <div
        data-testid="custom-upload"
        onClick={async () => {
          const mockFile = new File(['mock-content'], 'test.mp4', {
            type: 'video/mp4',
          }) as unknown as RcFile;
          await capturedBeforeUpload?.(mockFile);
          onChange?.(pendingChangeArg.current);
        }}
      >
        {children}
      </div>
    );
  }),
}));

vi.mock('@/components/VideoPlayer', () => ({
  default: vi.fn(() => <div data-testid="video-player" />),
}));

vi.mock('../utils/captureVideoFrame', () => ({
  captureVideoFrame: vi.fn().mockResolvedValue(undefined),
  revokeLocalUrl: vi.fn(),
}));

const createMockController = () => ({
  createSession: vi.fn(),
  uploadPart: vi.fn(),
  getSessionStatus: vi.fn(),
  cancelSession: vi.fn(),
  completeSession: vi.fn(),
});

const mockFile: VideoUploadFile = {
  uid: '1',
  name: 'test-video.mp4',
  lastModified: 1234567890,
  size: 1024 * 1024 * 50,
  type: 'video/mp4',
  status: 'done',
  url: 'https://example.com/video.mp4',
  duration: 18,
};

describe('VideoUpload 组件', () => {
  beforeEach(() => {
    mockVideoDurationValue.value = 600;
    mockVideoWidthValue.value = 1080;
    mockVideoHeightValue.value = 1920;
  });

  describe('无上传项状态', () => {
    it('当 value 为空时渲染空状态', () => {
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
      };

      render(<VideoUpload {...props} />);

      expect(screen.getByText('点击或拖拽上传视频')).toBeInTheDocument();
      expect(
        screen.getByText('支持 mp4/mov，单文件最大500MB，上传后自动预览'),
      ).toBeInTheDocument();
    });
  });

  describe('已上传状态', () => {
    it('当有上传文件时渲染已上传视图', () => {
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [mockFile],
        onChange: vi.fn(),
      };

      render(<VideoUpload {...props} />);

      expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
      expect(screen.getByText('重新选择视频')).toBeInTheDocument();
      expect(screen.getByText('移除视频')).toBeInTheDocument();
    });

    it('点击移除视频按钮时清空文件', () => {
      const onChange = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [mockFile],
        onChange,
      };

      render(<VideoUpload {...props} />);

      const removeBtn = screen.getByText('移除视频');
      fireEvent.click(removeBtn);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('视频时长显示', () => {
    it('显示格式化后的时长', () => {
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [{ ...mockFile, duration: 125 }],
        onChange: vi.fn(),
      };

      render(<VideoUpload {...props} />);

      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });

  describe('UploadCompleteData 合并', () => {
    it('done 状态时 previewUrl 写入 file.url，durationMs 换算为 duration 秒', async () => {
      const uploadCompleteResponse = {
        mediaAssetId: 'media-v1',
        fileSizeBytes: String(1024 * 1024 * 80),
        previewUrl: '/api/v1/content/media/media-v1/preview',
        mimeType: 'video/mp4',
        widthPx: 1080,
        heightPx: 1920,
        durationMs: 12500,
        ratio: '9:16',
        probeError: null,
      };

      pendingChangeArg.current = {
        file: {
          uid: 'v-new',
          name: 'short.mp4',
          lastModified: 222,
          size: 1024 * 1024 * 80,
          type: 'video/mp4',
          status: 'done',
          response: uploadCompleteResponse,
        },
        fileList: [],
      };

      const onChange = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
      });

      expect(onChange).toHaveBeenCalled();
      const [first] = onChange.mock.calls[onChange.mock.calls.length - 1] ?? [];
      expect(Array.isArray(first)).toBe(true);
      const merged = first[0];
      expect(merged.url).toBe('/api/v1/content/media/media-v1/preview');
      expect(merged.mediaAssetId).toBe('media-v1');
      expect(merged.mimeType).toBe('video/mp4');
      expect(merged.duration).toBeCloseTo(12.5);
      expect(merged.ratio).toBe('9:16');
    });
  });

  describe('视频时长校验', () => {
    it('时长超过 maxDuration 时调用 onDurationError', async () => {
      mockVideoDurationValue.value = 600;
      const onDurationError = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
        maxDuration: 300,
        onDurationError,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onDurationError).toHaveBeenCalled();
    });

    it('时长小于 minDuration 时调用 onDurationError', async () => {
      mockVideoDurationValue.value = 3;
      const onDurationError = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
        minDuration: 4,
        onDurationError,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onDurationError).toHaveBeenCalled();
    });

    it('时长在有效范围内时不调用 onDurationError', async () => {
      mockVideoDurationValue.value = 10;
      const onDurationError = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
        minDuration: 4,
        maxDuration: 300,
        onDurationError,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onDurationError).not.toHaveBeenCalled();
    });
  });

  describe('视频比例校验', () => {
    it('比例不符合 acceptedRatios 时调用 onRatioError', async () => {
      mockVideoWidthValue.value = 800;
      mockVideoHeightValue.value = 600;
      const onRatioError = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
        acceptedRatios: ['9:16', '16:9'],
        onRatioError,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onRatioError).toHaveBeenCalled();
      const [_file, actualRatio, acceptedRatios] = onRatioError.mock.calls[0];
      expect(actualRatio).toBe('4:3');
      expect(acceptedRatios).toEqual(['9:16', '16:9']);
    });

    it('比例符合 acceptedRatios 时不调用 onRatioError', async () => {
      mockVideoWidthValue.value = 1080;
      mockVideoHeightValue.value = 1920;
      const onRatioError = vi.fn();
      const props: VideoUploadProps = {
        uploadController: createMockController(),
        value: [],
        onChange: vi.fn(),
        acceptedRatios: ['9:16', '16:9'],
        onRatioError,
      };

      render(<VideoUpload {...props} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-upload'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onRatioError).not.toHaveBeenCalled();
    });
  });
});
