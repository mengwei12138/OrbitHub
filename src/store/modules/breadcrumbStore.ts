import { create } from 'zustand';

export type BreadcrumbOverride = {
  items?: { path?: string; name: string }[];
  toolBar?: React.ReactNode;
  props?: Partial<{
    separator: React.ReactNode;
  }>;
};

type BreadcrumbState = {
  overrides: Record<string, BreadcrumbOverride>;
  setOverride: (pathname: string, override: BreadcrumbOverride) => void;
  clearOverride: (pathname: string) => void;
};

const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  overrides: {},

  setOverride: (pathname, override) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [pathname]: override,
      },
    })),

  clearOverride: (pathname) =>
    set((state) => {
      const newOverrides = { ...state.overrides };
      delete newOverrides[pathname];
      return { overrides: newOverrides };
    }),
}));

export { useBreadcrumbStore };
export default useBreadcrumbStore;
