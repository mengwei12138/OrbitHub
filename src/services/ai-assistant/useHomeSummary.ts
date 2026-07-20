import { useQuery } from '@tanstack/react-query';

import { homeSummaryQueryOptions } from './queryOptions';

export const useHomeSummary = () => useQuery(homeSummaryQueryOptions());
