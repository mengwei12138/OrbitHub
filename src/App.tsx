import { Skeleton } from 'antd';
import { Suspense } from 'react';
import { AppRoutes } from '@/routes';
import { setLoggerLevel } from '@/utils/logger';

function App() {
  setLoggerLevel(import.meta.env.MODE === 'development');
  return (
    <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
