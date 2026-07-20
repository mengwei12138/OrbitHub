import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setLoggerLevel } from '@/utils/logger';

setLoggerLevel(true);

const noop = (): void => {};

/** AntV G2 / @ant-design/plots 在 happy-dom 下需要可用的 2D Canvas 上下文 */
const createCanvas2dStub = (): CanvasRenderingContext2D => {
  const stub = {
    canvas: document.createElement('canvas'),
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    scale: noop,
    translate: noop,
    rotate: noop,
    transform: noop,
    setTransform: noop,
    resetTransform: noop,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    arcTo: noop,
    rect: noop,
    clip: noop,
    fill: noop,
    stroke: noop,
    measureText: () => ({ width: 0 }),
    fillText: noop,
    strokeText: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    drawImage: noop,
    getImageData: () => new ImageData(new Uint8ClampedArray(4), 1, 1),
    putImageData: noop,
    fillStyle: '#000',
    strokeStyle: '#000',
    globalAlpha: 1,
    lineWidth: 1,
    font: '12px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
  };
  return stub as unknown as CanvasRenderingContext2D;
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value(this: HTMLCanvasElement, contextId: string) {
    if (contextId === '2d') {
      return createCanvas2dStub();
    }
    return null;
  },
});

// jsdom 兼容：matchMedia polyfill
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// happy-dom 兼容：如 happy-dom 内置支持 matchMedia，此 polyfill 可移除
