import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import {
  mapWorkSummaryToCardItem,
  worksListQueryOptions,
} from '@/services/content-generation';
import { useUserStore } from '@/store/modules/userStore';
import ImageGeneration from './components/ImageGeneration';
import MyWorks from './components/MyWorks';
import VideoGeneration from './components/VideoGeneration';
import { MY_WORKS_TITLE_TENANT, MY_WORKS_TITLE_USER } from './constants';
import styles from './style.module.css';

const ContentGeneration = () => {
  const navigate = useNavigate();
  // 卡片标题与 owner 行按角色切换：
  // 普通管理员看自己的作品；租户管理员看本租户全部普通管理员的作品。
  // 数据隔离由后端按 JWT 角色强制；前端只决定 UI 文案。
  const isTenantAdmin = useUserStore(
    (s) => s.roles?.includes('TENANT_ADMIN') ?? false,
  );

  const { data: worksPage, isLoading: worksLoading } = useQuery(
    worksListQueryOptions({ page: 1, pageSize: 3 }),
  );

  const works = (worksPage?.list ?? []).map(mapWorkSummaryToCardItem);

  const handleVideoGenerate = () => {
    navigate('/content-generation/video-generation');
  };

  const handleImageGenerate = () => {
    navigate('/content-generation/image-generation');
  };

  const handleViewAll = () => {
    navigate('/content-generation/my-works');
  };

  const handleViewDetail = (id: string) => {
    navigate(`/content-generation/works/${id}`);
  };

  return (
    <div className={styles.container}>
      <PageHeader title="内容生成" />
      <div className={styles.content}>
        <Spin spinning={worksLoading}>
          <MyWorks
            works={works}
            title={isTenantAdmin ? MY_WORKS_TITLE_TENANT : MY_WORKS_TITLE_USER}
            isTenantAdmin={isTenantAdmin}
            onViewAll={handleViewAll}
            onViewDetail={handleViewDetail}
          />
        </Spin>
        <div className={styles.entryCards}>
          <VideoGeneration onStartGenerate={handleVideoGenerate} />
          <ImageGeneration onStartGenerate={handleImageGenerate} />
        </div>
      </div>
    </div>
  );
};

export default ContentGeneration;
