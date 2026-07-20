export type TagOverviewStats = {
  hot: number;
  content: number;
  emotion: number;
  disabled: number;
};

export type TagOverviewProps = {
  stats: TagOverviewStats;
  loading?: boolean;
};
