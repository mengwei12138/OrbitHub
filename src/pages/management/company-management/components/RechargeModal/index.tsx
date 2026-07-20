import { ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Form, message } from 'antd';
import { useEffect } from 'react';
import { CustomModal } from '@/components';
import { balanceQueryOptions, useRechargeTenant } from '@/services/admin-proxy';

interface RechargeModalProps {
  open: boolean;
  tenantId: string;
  companyName: string;
  currentPackageName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  points: number;
  remark?: string;
};

/**
 * 手动充值积分（PRD §3.2）。
 *
 * 调用阶段④后端 POST /api/v1/admin/proxy/tenants/{id}/recharge，
 * 后端用该公司 api_key 调外部矩阵服务 /api/admin/matrix/points/add 充值。
 *
 * 注：阶段①前端不展示"当前套餐积分 / 充值积分"等实时数据
 *（这些来自外部矩阵服务的 balance 接口，留阶段④前端做 dashboard 时统一接入）。
 */
const RechargeModal: React.FC<RechargeModalProps> = ({
  open,
  tenantId,
  companyName,
  currentPackageName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const recharge = useRechargeTenant();
  const { data: balance } = useQuery({
    ...balanceQueryOptions(open ? tenantId : undefined),
    enabled: open && !!tenantId,
  });

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as FormValues;
      const remark = values.remark?.trim();
      await recharge.mutateAsync({
        tenantId,
        body: {
          points: values.points,
          ...(remark ? { remark } : {}),
        },
      });
      message.success(
        `成功为公司【${companyName}】充值 ${values.points.toLocaleString()} 积分`,
      );
      onSuccess();
    } catch (e) {
      if ((e as Error).message) {
        message.error((e as Error).message);
      }
    }
  };

  const loading = recharge.isPending;

  return (
    <CustomModal
      open={open}
      title={`手动充值积分 - ${companyName}`}
      width={520}
      submitter={{
        render: () => [
          <button
            key="cancel"
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: 80,
              height: 32,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: '#fff',
              color: '#595959',
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            取消
          </button>,
          <button
            key="submit"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: 100,
              height: 32,
              border: 'none',
              borderRadius: 4,
              background: '#1677ff',
              color: '#fff',
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginLeft: 8,
            }}
          >
            {loading ? '充值中…' : '确认充值'}
          </button>,
        ],
      }}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
      form={form}
    >
      {/* PRD §3.2 / figma：仅展示 当前套餐 / 当前套餐积分 / 当前充值积分 */}
      <div
        style={{
          background: '#f7faff',
          border: '1px solid #d9e8ff',
          borderRadius: 6,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#8c8c8c' }}>当前套餐：</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}>
            {currentPackageName || '-'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#8c8c8c' }}>当前套餐积分：</span>
          <span
            style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}
            data-testid="recharge-package-points"
          >
            {balance ? (balance.packagePoints ?? 0).toLocaleString() : '-'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#8c8c8c' }}>当前充值积分：</span>
          <span
            style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}
            data-testid="recharge-current-recharge"
          >
            {balance ? (balance.totalRecharge ?? 0).toLocaleString() : '-'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <ProFormDigit
          name="points"
          label="充值数量"
          rules={[
            { required: true, message: '请输入充值数量' },
            { type: 'number', min: 1, message: '充值数量必须大于0' },
            { type: 'number', max: 1000000, message: '超出单次充值上限' },
          ]}
          placeholder="请输入充值数量"
          fieldProps={{
            precision: 0,
            addonAfter: (
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>积分</span>
            ),
          }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <ProFormTextArea
          name="remark"
          label="操作备注"
          placeholder="选填：充值原因或客户信息"
          rules={[{ max: 200, message: '超出最大长度，最多支持 200 字符' }]}
          fieldProps={{
            maxLength: 200,
            showCount: true,
            autoSize: { minRows: 2, maxRows: 4 },
          }}
        />
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#d98c0d',
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        ⚠ 充值后充值积分字段将增加，不影响套餐积分。
      </div>
    </CustomModal>
  );
};

export default RechargeModal;
