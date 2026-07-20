import { Button } from 'antd';
import imageIcon from '../../images/icon-image-generation.svg';
import styles from './style.module.css';

type ImageGenerationProps = {
  onStartGenerate: () => void;
};

const ImageGeneration: React.FC<ImageGenerationProps> = ({
  onStartGenerate,
}) => {
  return (
    <div className={styles.container}>
      <img src={imageIcon} alt="图文生成" className={styles.iconBlock} />
      <div className={styles.title}>图文生成</div>
      <div className={styles.description}>
        填写产品信息，AI 智能生成营销图文内容
      </div>
      <div className={styles.tags}>封面图 · 详情图 · 主图 · 小红书文案</div>
      <Button type="primary" block onClick={onStartGenerate}>
        立即生成
      </Button>
    </div>
  );
};

export default ImageGeneration;
