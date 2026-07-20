export type ContentItem = {
  id: string;
  cover: string;
  title: string;
  playCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
};

export type ContentTablePagination = {
  current: number;
  pageSize: number;
  total: number;
};
