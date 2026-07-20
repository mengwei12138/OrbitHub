import { fireEvent, screen, waitFor } from '@testing-library/react';

/**
 * 预警区等也会出现同名账号文案，需点击「内容表现」表格内带链接的账号名称。
 * 表格数据异步加载，需轮询直至出现可点击链接。
 */
export async function fireClickContentPerformanceAccountLink(
  displayName: string,
) {
  const link = await waitFor(() => {
    const found = screen
      .getAllByText(displayName)
      .map((el) => el.closest('a'))
      .find((a): a is HTMLAnchorElement => a !== null);
    if (!found) {
      throw new Error(`未找到「${displayName}」对应的账号详情链接`);
    }
    return found;
  });
  fireEvent.click(link);
}
