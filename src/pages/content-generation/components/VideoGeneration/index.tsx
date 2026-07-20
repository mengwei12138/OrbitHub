import { Button } from 'antd';
import videoIcon from '../../images/icon-video-generation.svg';
import styles from './style.module.css';

type VideoGenerationProps = {
  onStartGenerate: () => void;
};

const VideoGeneration: React.FC<VideoGenerationProps> = ({
  onStartGenerate,
}) => {
  return (
    <div className={styles.container}>
      <img src={videoIcon} alt="视频生成" className={styles.iconBlock} />
      <div className={styles.title}>视频生成</div>
      <div className={styles.description}>
        上传产品图片/视频，AI 智能生成高质量短视频
      </div>
      <div className={styles.tags}>
        支持多素材上传 · 智能场景适配 · 多种清晰度
      </div>
      <Button type="primary" block onClick={onStartGenerate}>
        立即生成
      </Button>
    </div>
  );
};

export default VideoGeneration;
