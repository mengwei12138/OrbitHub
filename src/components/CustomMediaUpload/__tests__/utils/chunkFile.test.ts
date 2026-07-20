import { describe, expect, it, vi } from 'vitest';

import {
  calculateSha256,
  generateFileId,
  splitFile,
} from '../../utils/chunkFile';

describe('chunkFile', () => {
  describe('splitFile', () => {
    it('应根据 chunkSize 正确分割文件', () => {
      const file = new File(['abcdefghij'], 'test.txt', { type: 'text/plain' });
      const chunks = splitFile(file, 4);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({
        blob: expect.any(Blob),
        index: 1,
        start: 0,
        end: 4,
      });
      expect(chunks[1]).toEqual({
        blob: expect.any(Blob),
        index: 2,
        start: 4,
        end: 8,
      });
      expect(chunks[2]).toEqual({
        blob: expect.any(Blob),
        index: 3,
        start: 8,
        end: 10,
      });
    });

    it('当文件大小小于 chunkSize 时应返回单个分片', () => {
      const file = new File(['abc'], 'small.txt', { type: 'text/plain' });
      const chunks = splitFile(file, 10);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({
        blob: expect.any(Blob),
        index: 1,
        start: 0,
        end: 3,
      });
    });

    it('分片序号应从 1 开始', () => {
      const file = new File(['abcdef'], 'test.txt', { type: 'text/plain' });
      const chunks = splitFile(file, 2);

      expect(chunks[0].index).toBe(1);
      expect(chunks[1].index).toBe(2);
      expect(chunks[2].index).toBe(3);
    });
  });

  describe('calculateSha256', () => {
    it('应正确计算 Blob 的 SHA-256', async () => {
      const blob = new Blob(['hello world']);
      const hash = await calculateSha256(blob);

      expect(hash).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      );
    });

    it('相同内容应产生相同的 hash', async () => {
      const blob1 = new Blob(['test']);
      const blob2 = new Blob(['test']);

      const hash1 = await calculateSha256(blob1);
      const hash2 = await calculateSha256(blob2);

      expect(hash1).toBe(hash2);
    });

    it('不同内容应产生不同的 hash', async () => {
      const blob1 = new Blob(['test1']);
      const blob2 = new Blob(['test2']);

      const hash1 = await calculateSha256(blob1);
      const hash2 = await calculateSha256(blob2);

      expect(hash1).not.toBe(hash2);
    });

    it('crypto.subtle 不可用时应降级使用 CryptoJS', async () => {
      vi.stubGlobal('crypto', {
        ...globalThis.crypto,
        subtle: undefined,
      });

      const blob = new Blob(['hello world']);
      const hash = await calculateSha256(blob);

      expect(hash).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      );

      vi.unstubAllGlobals();
    });

    it('crypto 不可用时应降级使用 CryptoJS', async () => {
      vi.stubGlobal('crypto', undefined);

      const blob = new Blob(['hello world']);
      const hash = await calculateSha256(blob);

      expect(hash).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      );

      vi.unstubAllGlobals();
    });

    it('CryptoJS 降级与原生 crypto.subtle 结果应一致', async () => {
      const blob = new Blob(['consistent data test']);

      const hashWithNative = await calculateSha256(blob);

      vi.stubGlobal('crypto', {
        ...globalThis.crypto,
        subtle: undefined,
      });

      const hashWithCryptoJS = await calculateSha256(blob);

      expect(hashWithNative).toBe(hashWithCryptoJS);

      vi.unstubAllGlobals();
    });

    it('空 blob 应产生特定 hash', async () => {
      const blob = new Blob(['']);
      const hash = await calculateSha256(blob);

      expect(hash).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    });

    it('二进制数据应正确计算 hash', async () => {
      const buffer = new Uint8Array([0, 1, 2, 3, 254, 255]);
      const blob = new Blob([buffer]);
      const hash = await calculateSha256(blob);

      expect(hash).toMatch(/^[a-f0-9]{64}$/u);
      expect(hash).toBe(
        '7ea646958715ed687aa9ac2f5d785feb1a93411f4f25fdd6c7fcc6ab07fdf0e3',
      );
    });

    it('二进制数据应正确计算 hash', async () => {
      const buffer = new Uint8Array([0, 1, 2, 3, 254, 255]);
      const blob = new Blob([buffer]);
      const hash = await calculateSha256(blob);

      expect(hash).toBe(
        '7ea646958715ed687aa9ac2f5d785feb1a93411f4f25fdd6c7fcc6ab07fdf0e3',
      );
    });

    it('分片边界情况应正确计算 hash', async () => {
      const file = new File(['abcdefghij'], 'test.txt', { type: 'text/plain' });
      const chunks = splitFile(file, 4);

      const hashPromises = chunks.map((chunk) => calculateSha256(chunk.blob));
      const hashes = await Promise.all(hashPromises);

      expect(hashes).toHaveLength(3);
      hashes.forEach((hash) => {
        expect(hash).toMatch(/^[a-f0-9]{64}$/u);
      });

      const hash1 = await calculateSha256(new Blob(['abcd']));
      const hash2 = await calculateSha256(new Blob(['efgh']));
      const hash3 = await calculateSha256(new Blob(['ij']));
      expect(hashes[0]).toBe(hash1);
      expect(hashes[1]).toBe(hash2);
      expect(hashes[2]).toBe(hash3);
    });

    it('大文件数据应正确计算 hash', async () => {
      const data = new Uint8Array(1024 * 1024);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      const blob = new Blob([data]);
      const hash = await calculateSha256(blob);

      expect(hash).toMatch(/^[a-f0-9]{64}$/u);
      expect(hash.length).toBe(64);
    });
  });

  describe('generateFileId', () => {
    it('应根据文件属性生成唯一 ID', () => {
      const file = new File(['content'], 'test.txt', {
        type: 'text/plain',
        lastModified: 1000,
      });

      const id = generateFileId(file);

      expect(id).toContain('test.txt');
      expect(id).toContain(String(file.size));
      expect(id).toContain('1000');
    });

    it('不同文件应生成不同 ID', () => {
      const file1 = new File(['content1'], 'test1.txt', {
        type: 'text/plain',
        lastModified: 1000,
      });
      const file2 = new File(['content2'], 'test2.txt', {
        type: 'text/plain',
        lastModified: 2000,
      });

      const id1 = generateFileId(file1);
      const id2 = generateFileId(file2);

      expect(id1).not.toBe(id2);
    });
  });
});
