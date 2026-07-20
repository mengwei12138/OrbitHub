export type FeatureCardType =
  | 'content-opt'
  | 'comment-reply'
  | 'message-reply'
  | 'tag-lib';

export type FeatureCardProps = {
  type: FeatureCardType;
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  path: string;
};
