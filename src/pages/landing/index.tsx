import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.nav}>
            <div className={styles.logo}>Orbithub</div>
            <nav className={styles.navLinks}>
              <a href="#features">产品功能</a>
              <a href="#scenes">使用场景</a>
              <a href="#contact">平台价值</a>
            </nav>
            <Button
              type="primary"
              className={styles.btn}
              onClick={handleLogin}
            >
              登录平台
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>
              账号矩阵驱动的
              <br />
              内容增长平台
            </h1>
            <p className={styles.heroDescription}>
              Orbithub 统一管理抖音、小红书等平台账号，通过 AI 内容生成、批量发布、
              数据分析与智能助手，帮助团队构建从内容生产到增长复盘的完整运营闭环。
            </p>

            <div className={styles.heroCard}>
              <div className={styles.dashboard}>
                <div className={styles.panel}>
                  <div className={`${styles.line} ${styles.short}`} />
                  <div className={`${styles.line} ${styles.mid}`} />
                  <div className={styles.line} />
                  <div className={`${styles.line} ${styles.short}`} />
                  <div className={`${styles.line} ${styles.mid}`} />
                </div>
                <div className={styles.panel}>
                  <div className={`${styles.line} ${styles.mid}`} />
                  <div className={styles.line} />
                  <div className={`${styles.line} ${styles.short}`} />
                  <div className={styles.line} />
                  <div className={`${styles.line} ${styles.mid}`} />
                  <div className={`${styles.line} ${styles.short}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>核心能力</h2>
            <p className={styles.sectionDesc}>
              覆盖账号矩阵管理、内容生成、批量发布与运营分析，让矩阵运营更高效。
            </p>

            <div className={styles.grid}>
              <div className={styles.feature}>
                <h3>账号矩阵管理</h3>
                <p>统一管理抖音、小红书等平台账号，支持账号分组、状态查看、归属协同与团队分工。</p>
              </div>
              <div className={styles.feature}>
                <h3>AI 内容生成</h3>
                <p>自动生成标题、文案、脚本、图文与营销素材，减少内容生产成本并提升效率。</p>
              </div>
              <div className={styles.feature}>
                <h3>批量发布</h3>
                <p>支持内容排期、批量发布、记录追踪与重发布，帮助团队减少重复操作。</p>
              </div>
              <div className={styles.feature}>
                <h3>数据分析</h3>
                <p>聚合账号表现、内容数据与增长趋势，辅助团队判断运营效果与策略方向。</p>
              </div>
              <div className={styles.feature}>
                <h3>AI 智能助手</h3>
                <p>为账号配置评论回复、私信回复、内容优化与运营建议等智能辅助能力。</p>
              </div>
              <div className={styles.feature}>
                <h3>全链路协同</h3>
                <p>把账号接入、内容生产、发布执行与数据复盘纳入同一工作流，形成持续增长闭环。</p>
              </div>
            </div>
          </div>
        </section>

        <section id="scenes" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>适用场景</h2>
            <p className={styles.sectionDesc}>
              面向需要批量内容运营、多账号管理和自动化增长的团队。
            </p>

            <div className={styles.scenes}>
              <div className={styles.tag}>本地生活</div>
              <div className={styles.tag}>品牌营销</div>
              <div className={styles.tag}>电商种草</div>
              <div className={styles.tag}>短剧推广</div>
              <div className={styles.tag}>教育培训</div>
              <div className={styles.tag}>MCN机构</div>
              <div className={styles.tag}>代运营团队</div>
            </div>
          </div>
        </section>

        <section id="contact" className={styles.cta}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>让每一个账号，都拥有一套可持续增长的运营系统</h2>
            <p className={styles.ctaDesc}>
              登录平台，查看 Orbithub 如何帮助你的团队提升矩阵运营效率。
            </p>
            <Button
              type="primary"
              className={styles.btn}
              onClick={handleLogin}
            >
              登录平台
            </Button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          © 2026 Orbithub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
