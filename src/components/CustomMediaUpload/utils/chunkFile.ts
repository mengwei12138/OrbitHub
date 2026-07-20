import * as CryptoJS from 'crypto-js';

export type ChunkItem = {
  blob: Blob;
  index: number;
  start: number;
  end: number;
};

export const splitFile = (file: File, chunkSize: number): ChunkItem[] => {
  const chunks: ChunkItem[] = [];
  let index = 1;
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push({
      blob: file.slice(start, end),
      index,
      start,
      end,
    });
    start = end;
    index++;
  }

  return chunks;
};

export const calculateSha256 = async (blob: Blob): Promise<string> => {
  if (crypto?.subtle?.digest) {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const arrayBuffer = await blob.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  return CryptoJS.SHA256(wordArray).toString();
};

export const generateFileId = (file: File): string => {
  const { name, size, lastModified } = file;
  return `${name}-${size}-${lastModified}`;
};
