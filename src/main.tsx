import '@/styles/common/vars.css';
import '@/styles/global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/api/queryClient';
import '@/prototype/bootstrap';

import App from './App';

const customLocale = {
  ...zhCN,
  Empty: {
    description: '暂无数据',
  },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={customLocale}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
