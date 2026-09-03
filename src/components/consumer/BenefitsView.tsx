import React, { useState } from 'react';
import { ChevronRight, X, ArrowUpRight } from 'lucide-react';
import { UserPointRecord, MerchantConfig } from '../../types';

interface BenefitsViewProps {
  points: UserPointRecord[];
  merchants: MerchantConfig[];
  onSelectMerchant: (merchant: MerchantConfig) => void;
}

// Custom SVG Illustration for 流通金 (Warm Peach Voucher / Coins)
const FlowVoucherIcon = () => (
  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
    {/* Background ticket */}
    <rect
      x="8"
      y="14"
      width="40"
      height="28"
      rx="6"
      fill="#FDBA74"
      fillOpacity="0.85"
      transform="rotate(-8 8 14)"
    />
    {/* Foreground ticket */}
    <rect
      x="12"
      y="18"
      width="44"
      height="32"
      rx="7"
      fill="#FB923C"
      stroke="#FED7AA"
      strokeWidth="2"
    />
    {/* Ticket dashed separator */}
    <line
      x1="26"
      y1="18"
      x2="26"
      y2="50"
      stroke="#FED7AA"
      strokeWidth="2"
      strokeDasharray="3 3"
    />
    {/* Currency symbol */}
    <text
      x="40"
      y="40"
      fill="#FFFFFF"
      fontSize="16"
      fontWeight="900"
      textAnchor="middle"
      fontFamily="sans-serif"
    >
      ¥
    </text>
  </svg>
);

// Custom SVG Illustration for 定向消费金 (Ice Blue Clipboard / Voucher)
const DirectedDocIcon = () => (
  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
    {/* Blue clipboard base */}
    <rect
      x="12"
      y="10"
      width="38"
      height="46"
      rx="7"
      fill="#60A5FA"
      fillOpacity="0.3"
      transform="rotate(-4 12 10)"
    />
    <rect
      x="15"
      y="12"
      width="38"
      height="44"
      rx="6"
      fill="#3B82F6"
    />
    {/* White Paper */}
    <rect
      x="19"
      y="18"
      width="30"
      height="34"
      rx="4"
      fill="#FFFFFF"
    />
    {/* Clipboard clip */}
    <rect
      x="27"
      y="10"
      width="14"
      height="6"
      rx="3"
      fill="#93C5FD"
      stroke="#2563EB"
      strokeWidth="1.5"
    />
    {/* Text lines */}
    <line x1="24" y1="26" x2="44" y2="26" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="32" x2="38" y2="32" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    {/* Small coin badge */}
    <circle cx="42" cy="42" r="7" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="2" />
    <text
      x="42"
      y="45.5"
      fill="#FFFFFF"
      fontSize="9"
      fontWeight="bold"
      textAnchor="middle"
      fontFamily="sans-serif"
    >
      ¥
    </text>
  </svg>
);

export const BenefitsView: React.FC<BenefitsViewProps> = ({
  points,
  merchants,
  onSelectMerchant,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter or pick the designated merchants (like 悦家折扣超市)
  const designatedMerchants = merchants.length >= 2 ? merchants.slice(0, 2) : merchants;

  return (
    <div className="flex-1 bg-[#F7F8FA] overflow-y-auto no-scrollbar pb-24 p-3.5 space-y-3.5">
      {/* 1. 顶部积分福利大卡片 (1:1 还原参考图) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#00C07F] via-[#00B578] to-[#059669] p-4 text-white shadow-md relative overflow-hidden">
        {/* Abstract subtle glass blur shapes in background */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 top-0 w-24 h-24 rounded-full bg-emerald-300/20 blur-lg pointer-events-none" />

        {/* Header Row: 积分福利 + 明细 > */}
        <div className="flex justify-between items-center relative z-10">
          <span className="text-sm font-bold text-white tracking-wide">积分福利</span>
          <button
            onClick={() => setShowDetailModal(true)}
            className="flex items-center space-x-0.5 px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-xs font-semibold text-white transition cursor-pointer"
            id="btn-points-detail"
          >
            <span>明细</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-90" />
          </button>
        </div>

        {/* PV 大数字 */}
        <div className="mt-2.5 flex items-baseline space-x-1.5 relative z-10">
          <span className="text-3xl font-black tracking-tight text-white drop-shadow-2xs">
            75.60
          </span>
          <span className="text-sm font-bold text-emerald-100 tracking-wide">PV</span>
        </div>

        {/* 底部说明文案 */}
        <p className="text-[11px] text-emerald-50/90 mt-3 leading-snug font-normal relative z-10">
          每次到店消费买单时，您获得积分的70%将自动转为积分福利
        </p>
      </div>

      {/* 2. 流通金余额 & 定向消费金余额 并排双卡片 (1:1 还原参考图) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 左卡：流通金余额 */}
        <div className="bg-gradient-to-b from-[#FFF8F3] to-[#FFFDFB] border border-[#FFE7D4] rounded-2xl p-3 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <h4 className="text-xs font-black text-gray-800">流通金余额</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
              平台任意商户消费可抵扣
            </p>
            <div className="flex items-baseline space-x-0.5 mt-2">
              <span className="text-xs font-bold text-gray-500">¥</span>
              <span className="text-xl font-black text-gray-900 leading-none">75.00</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-2 pt-1">
            <span className="bg-[#FFF3E0] text-[#D97706] text-[9px] font-bold px-2 py-0.5 rounded-full">
              全平台通用
            </span>
            <div className="shrink-0 -mb-1 -mr-1">
              <FlowVoucherIcon />
            </div>
          </div>
        </div>

        {/* 右卡：定向消费金余额 */}
        <div className="bg-gradient-to-b from-[#F2F8FF] to-[#FAFCFF] border border-[#DCEDFF] rounded-2xl p-3 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <h4 className="text-xs font-black text-gray-800">定向消费金余额</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
              平台指定商户消费可抵扣
            </p>
            <div className="flex items-baseline space-x-0.5 mt-2">
              <span className="text-xs font-bold text-gray-500">¥</span>
              <span className="text-xl font-black text-gray-900 leading-none">120.00</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-2 pt-1">
            <span className="bg-[#E6F4FF] text-[#2563EB] text-[9px] font-bold px-2 py-0.5 rounded-full">
              指定商户可用
            </span>
            <div className="shrink-0 -mb-1 -mr-1">
              <DirectedDocIcon />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 平台指定商户 模块 (1:1 还原参考图) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-sm font-black text-gray-900 tracking-tight">平台指定商户</h3>
          <span className="text-[11px] text-gray-400 font-medium">定向抵扣</span>
        </div>

        <div className="space-y-2.5">
          {/* Item 1 */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80"
                  alt="悦家折扣超市"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 leading-snug">悦家折扣超市</h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">平台指定商户</p>
              </div>
            </div>

            <button
              onClick={() => {
                const target = designatedMerchants[0] || merchants[0];
                if (target) onSelectMerchant(target);
              }}
              className="px-3.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white font-bold text-xs rounded-full shadow-2xs transition cursor-pointer"
              id="btn-consume-store-1"
            >
              立即消费
            </button>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80"
                  alt="悦家折扣超市"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 leading-snug">悦家折扣超市</h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">平台指定商户</p>
              </div>
            </div>

            <button
              onClick={() => {
                const target = designatedMerchants[1] || merchants[0];
                if (target) onSelectMerchant(target);
              }}
              className="px-3.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white font-bold text-xs rounded-full shadow-2xs transition cursor-pointer"
              id="btn-consume-store-2"
            >
              立即消费
            </button>
          </div>
        </div>
      </div>

      {/* 4. 福利账户明细 模块 (1:1 还原参考图) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-sm font-black text-gray-900 tracking-tight">福利账户明细</h3>
          <button
            onClick={() => setShowDetailModal(true)}
            className="flex items-center text-[11px] text-[#00B578] font-bold hover:underline cursor-pointer"
            id="btn-view-all-history"
          >
            <span>查看全部明细</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 明细项：平台发放 收益流通金 +12.80 PV */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Red Circle with ¥ icon */}
            <div className="w-9 h-9 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              <span>¥</span>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 leading-snug">平台发放</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">收益流通金</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-[#00B578] tracking-tight">
              +12.80 PV
            </span>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">2026-06-12</p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-900">福利账户全部明细</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 max-h-72 overflow-y-auto no-scrollbar">
              <div className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">
                    ¥
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">平台发放</span>
                    <span className="text-[10px] text-gray-400">收益流通金 · 2026-06-12</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#00B578]">+12.80 PV</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    ¥
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">到店消费自动转存</span>
                    <span className="text-[10px] text-gray-400">悦家折扣超市 · 2026-06-10</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#00B578]">+28.50 PV</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    ¥
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">定向消费金划拨</span>
                    <span className="text-[10px] text-gray-400">社区专属权益 · 2026-06-01</span>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600">+34.30 PV</span>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
