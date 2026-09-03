import React, { useState } from 'react';
import {
  User,
  Store,
  Users,
  Layers,
  Truck,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Phone,
  Lock,
} from 'lucide-react';

export type UserRole = 'consumer' | 'merchant' | 'promoter' | 'rider' | 'platform';

interface RoleLoginModalProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onClose: () => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const [selected, setSelected] = useState<UserRole>(currentRole);

  const rolesList: {
    id: UserRole;
    name: string;
    title: string;
    subtext: string;
    icon: React.ReactNode;
    colorClass: string;
    badgeText: string;
    accountDesc: string;
  }[] = [
    {
      id: 'consumer',
      name: '普通消费者 / 买家',
      title: 'Ella (黄金会员)',
      subtext: '商圈浏览 · 现货到店自提 · 3km配送 · 积分抵扣',
      icon: <User className="w-5 h-5" />,
      colorClass: 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-500',
      badgeText: 'C端买家',
      accountDesc: '手机尾号 5698 · 福利积分 75.60 PV',
    },
    {
      id: 'merchant',
      name: '社区商户 / 店长助手',
      title: '老街坊果蔬生鲜超市',
      subtext: '5分钟语音接单 · 6位提货核销台 · 现货库存管理',
      icon: <Store className="w-5 h-5" />,
      colorClass: 'from-teal-600 to-emerald-700 text-teal-800 bg-teal-50 border-teal-600',
      badgeText: 'B端商户',
      accountDesc: '绿茵路128号门店 · 3km自提+配送',
    },
    {
      id: 'promoter',
      name: '社区推广专员 / 合伙人',
      title: '张伟 (金牌推广员)',
      subtext: 'PRD 7.6 核心五方之一 · 订单享 2% 延时分润',
      icon: <Users className="w-5 h-5" />,
      colorClass: 'from-purple-600 to-indigo-700 text-purple-800 bg-purple-50 border-purple-600',
      badgeText: '2% 推广分润',
      accountDesc: '邀请码 TG-88992 · 签约3家商户',
    },
    {
      id: 'rider',
      name: '同城运力配送员 / 骑手',
      title: '顺丰同城 · 张明峰',
      subtext: '微信物流助手/达达 · 到店取货 · 实时轨迹 · 小费',
      icon: <Truck className="w-5 h-5" />,
      colorClass: 'from-blue-600 to-cyan-700 text-blue-800 bg-blue-50 border-blue-600',
      badgeText: '同城运力',
      accountDesc: '顺丰同城专送 · 准时率 99.8%',
    },
    {
      id: 'platform',
      name: '平台运营 / 分账监管',
      title: '五方延时分账管理台',
      subtext: '零误差延时分账 · 12状态机演练 · 类目佣金(3%)',
      icon: <Layers className="w-5 h-5" />,
      colorClass: 'from-slate-700 to-gray-900 text-slate-800 bg-slate-50 border-slate-700',
      badgeText: '平台管控',
      accountDesc: '资金零落地 · 汇聚支付 T+1 托管',
    },
  ];

  const handleConfirmSwitch = () => {
    onSelectRole(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-[32px] w-full max-w-[390px] p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 border-t border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">多角色身份切换与登录</h2>
              <p className="text-[10px] text-gray-400">选择不同角色体验社区购全链路生态</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
          {rolesList.map((r) => {
            const isChosen = selected === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isChosen
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isChosen ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.icon}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-black text-gray-900">{r.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-gray-100 text-gray-600">
                        {r.badgeText}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-700">{r.title}</div>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{r.subtext}</p>
                    <p className="text-[9px] text-emerald-700/80 font-mono pt-0.5">{r.accountDesc}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isChosen ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChosen && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmSwitch}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>一键切换并以此身份进入小程序</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
