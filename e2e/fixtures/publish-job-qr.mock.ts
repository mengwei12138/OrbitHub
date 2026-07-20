/** 可见的 mock 二维码（SVG），便于 E2E 截图验证 */
export const MOCK_QR_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff"/><rect x="8" y="8" width="32" height="32" fill="#000"/><rect x="80" y="8" width="32" height="32" fill="#000"/><rect x="8" y="80" width="32" height="32" fill="#000"/><rect x="44" y="44" width="32" height="32" fill="#000"/><text x="60" y="112" text-anchor="middle" font-size="10" fill="#666">MOCK QR</text></svg>',
)}`;

const now = new Date().toISOString();

export const mockPublishJobResponse = {
  code: 0,
  success: true,
  message: 'success',
  ts: Date.now(),
  data: {
    jobId: 'job-e2e-qr',
    jobStatus: 'ACTIVE',
    overallPercent: 30,
    totalCount: 1,
    succeededCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    records: [
      {
        recordId: '121',
        accountId: 'acc-1',
        accountNickname: '抖音号-E2E',
        platform: 'douyin',
        stage: 'PLATFORM_PROCESSING',
        percent: 50,
        message: '请使用原设备扫码验证',
        updatedAt: now,
        verifyType: 'qr',
        qrCodeSrc: MOCK_QR_SRC,
        verifyErrorCode: null,
      },
    ],
    updatedAt: now,
  },
};
