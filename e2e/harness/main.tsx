import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import PublishProgressModal from '@/pages/content/components/PublishProgressModal';
import '@/styles/global.css';

function HarnessApp() {
  useEffect(() => {
    document.body.dataset.e2eReady = 'true';
  }, []);

  return (
    <PublishProgressModal
      open
      jobId="job-e2e-qr"
      onClose={() => undefined}
      onBackgroundRun={() => undefined}
    />
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root not found');
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HarnessApp />
    </QueryClientProvider>
  </StrictMode>,
);
