export type TabBarProps = {
  tabs: readonly { key: string; name: string }[];
  activeTab: string;
  onChange: (key: string) => void;
};
