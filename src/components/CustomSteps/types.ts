export type StepItem = {
  title: string;
};

export type CustomStepsProps = {
  current?: number;
  items?: StepItem[];
  className?: string;
};
