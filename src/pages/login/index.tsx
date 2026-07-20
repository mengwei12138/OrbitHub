import { Button, Form, Input, message } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefaultRouteByRoles } from '@/routes/defaultRoute';
import { useLogin } from '@/services/auth';
import type { TokenResponse } from '@/services/auth/types';
import { useUserStore } from '@/store/modules/userStore';
import AccountRequestModal from './components/AccountRequestModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import EyeIcon from './images/icon-eye.svg';
import LockIcon from './images/icon-lock.svg';
import PhoneIcon from './images/icon-phone.svg';

import styles from './style.module.css';

type LoginFormValues = {
  phone: string;
  password: string;
};

type LoginFeature = {
  title: string;
  description: string;
};

type LoginHighlight = {
  value: string;
  label: string;
};

const LOGIN_FEATURES: LoginFeature[] = [
  {
    title: '账号矩阵统一管理',
    description: '集中管理多平台账号、成员分工、权限归属与日常运营动作，保持矩阵协同有序运转。',
  },
  {
    title: '内容生成到发布闭环',
    description: '从 AI 辅助生成、素材整理、内容编辑到多账号分发，形成稳定的生产与投放链路。',
  },
  {
    title: '数据分析持续回流',
    description: '通过内容表现、账号趋势与预警数据回看运营结果，持续优化选题、发布与互动策略。',
  },
];

const LOGIN_HIGHLIGHTS: LoginHighlight[] = [
  { value: 'Multi', label: '账号矩阵协同' },
  { value: 'AI', label: '内容生成提效' },
  { value: 'Data', label: '分析驱动运营' },
];

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>();
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [accountRequestOpen, setAccountRequestOpen] = useState(false);

  const { setToken, setUserInfo, setPermissions, setRoles } =
    useUserStore();
  // 同步在飞标志：isPending 是 React state，要等下一帧才翻 true，毫秒级双击/双回车
  // 都会在同一个闭包里读到 false 而漏过守卫，必须用 ref 在事件 handler 内即时拦截。
  const submittingRef = useRef(false);

  const { mutate: login, isPending } = useLogin({
    onSuccess: (data: TokenResponse) => {
      if (data.access_token) {
        setToken(data.access_token);
      }
      if (data.user) {
        setUserInfo({
          id: data.user.userId,
          username: data.user.username,
          tenantId: data.user.tenantId,
        });
        setPermissions(data.user.permissions ?? []);
        setRoles(data.user.roles ?? []);
      }
      message.success('登录成功');
      navigate(getDefaultRouteByRoles(data.user.roles));
    },
    onError: (error: Error) => {
      submittingRef.current = false;
      message.error(error.message || '登录失败');
    },
  });

  const handleSubmit = (values: LoginFormValues) => {
    if (submittingRef.current || isPending) return;
    submittingRef.current = true;
    login({ username: values.phone.trim(), password: values.password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <section className={styles.brandPanel}>
          <div className={styles.brandBackdrop} />
          <div className={styles.brandContent}>
            <div className={styles.heroContent}>
              <h2 className={styles.heroHeading}>
                统一驱动账号矩阵、内容生产与运营增长
              </h2>
              <p className={styles.heroDescription}>
                围绕账号矩阵管理构建内容生成、发布分发、互动运营与数据分析的全链路工作台，让团队在同一平台完成从生产到复盘的连续协作。
              </p>
            </div>

            <div className={styles.highlightGrid}>
              {LOGIN_HIGHLIGHTS.map((item) => (
                <div key={item.label} className={styles.highlightCard}>
                  <strong className={styles.highlightValue}>{item.value}</strong>
                  <span className={styles.highlightLabel}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.featureList}>
              {LOGIN_FEATURES.map((item) => (
                <div key={item.title} className={styles.featureItem}>
                  <span className={styles.featureMarker} />
                  <div className={styles.featureBody}>
                    <h3 className={styles.featureTitle}>{item.title}</h3>
                    <p className={styles.featureDescription}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.loginPanel}>
          <div className={styles.card}>
            <div className={styles.header}>
              <span className={styles.panelTag}>账号登录</span>
              <h2 className={styles.panelTitle}>欢迎进入矩阵系统</h2>
              <p className={styles.subtitle}>使用手机号和密码登录当前原型工作台</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              className={styles.form}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="phone"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input
                  prefix={<img src={PhoneIcon} alt="phone" />}
                  placeholder="请输入手机号"
                  size="large"
                  maxLength={50}
                  autoComplete="username"
                  disabled={isPending}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<img src={LockIcon} alt="lock" />}
                  placeholder="请输入密码"
                  size="large"
                  iconRender={(visible) => (
                    <img src={EyeIcon} alt={visible ? 'hide' : 'show'} />
                  )}
                  className={styles.passwordInput}
                  autoComplete="current-password"
                  disabled={isPending}
                />
              </Form.Item>

              <div className={styles.rememberRow}>
                <span
                  className={styles.forgotLink}
                  onClick={() => setForgotModalOpen(true)}
                >
                  忘记密码
                </span>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isPending}
                  // antd 的 loading 只加 pointer-events:none 的 CSS，原生 <button> 仍可触达
                  // （Enter / 自动化点击）；显式 disabled 才能 100% 拦住第二次提交。
                  disabled={isPending}
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>

            <div className={styles.panelFooter}>
              <span className={styles.footerLabel}>平台能力</span>
              <p className={styles.footerText}>
                面向矩阵化运营场景，统一承接账号管理、内容生成、发布执行与数据洞察。
              </p>
              <div className={styles.applyRow}>
                <span className={styles.applyHint}>
                  当前平台采用邀请制开通
                </span>
                <button
                  type="button"
                  className={styles.applyLink}
                  onClick={() => setAccountRequestOpen(true)}
                >
                  申请开通账号
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AccountRequestModal
        open={accountRequestOpen}
        onClose={() => setAccountRequestOpen(false)}
      />
      <ForgotPasswordModal
        open={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="忘记密码"
        content="请联系系统管理员重置您的密码"
      />
    </div>
  );
};

export default Login;
