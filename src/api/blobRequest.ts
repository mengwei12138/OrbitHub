import axios from 'axios';

import { useUserStore } from '@/store/modules/userStore';

const blobRequest = axios.create({
  timeout: 0, // timeout AI不可以修改
  withCredentials: true,
});

blobRequest.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

blobRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

export default blobRequest;
