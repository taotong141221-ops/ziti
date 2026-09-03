import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Share2,
  QrCode,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Wallet,
  Copy,
  CheckCircle2,
  Sparkles,
  Store,
  Clock,
} from 'lucide-react';
import { Order } from '../../types';

interface PromoterWorkbenchProps {
  orders: Order[];
  onSwitchRole: (role: string) => void;
}

export const PromoterWorkbench: React.FC<PromoterWorkbenchProps> = ({
  orders,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'commissions' | 'poster'>('overview');
  const [copied, setCopied] = useState(false);

  // Promoter commissions (2% of net goods amount from orders)
  const promoterOrders = orders.filter((o) => o.payStatus === 1);
  const totalEarned = promoterOrders.reduce((sum, o) => sum + (o.splitDetail?.promoter || 0.26), 0);
  const todayEarned = Number((totalEarned * 0.45).toFixed(2));
  const pendingSettlement = Number((totalEarned * 0.2).toFixed(2));

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar pb-24 p-3.5 space-y-3.5">
      {/* Promoter Identity Card */}
      <div className="bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-purple-900 flex items-center justify-center font-black text-lg shadow-sm border border-amber-300/40">
              张
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-black tracking-tight">张伟 (合伙人)</h1>
                <span className="text-[10px] bg-amber-400/20 border border-amber-400/50 text-amber-300 px-1.5 py-0.2 rounded-full font-bold flex items-center space-x-0.5">
                  <Award className="w-2.5 h-2.5" />
                  <span>金牌推广专员</span>
                </span>
              </div>
              <p className="text-[11px] text-purple-200/80 mt-0.5">推广邀请码: <span className="font-mono font-bold text-amber-300">TG-88992</span></p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('poster')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-xs flex items-center space-x-1 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span className="text-[11px]">推广码</span>
          </button>
        </div>

        {/* Earnings Dashboard (PRD 7.6 2% 分润) */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-purple-200/80 block">今日推广预估</span>
            <span className="text-sm font-black text-amber-300 mt-0.5 block font-mono">¥{todayEarned.toFixed(2)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-purple-200/80 block">累计到账分成 (2%)</span>
            <span className="text-sm font-black text-white mt-0.5 block font-mono">¥{totalEarned.toFixed(2)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-purple-200/80 block">可提现余额</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block font-mono">¥{(totalEarned - pendingSettlement).toFixed(2)}</span>
          </div>
        </div>

        {/* Quick Withdraw Bar */}
        <div className="mt-3 flex items-center justify-between bg-black/20 rounded-xl px-3 py-1.5 text-xs">
          <div className="flex items-center space-x-1.5 text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">资金直连汇聚支付 T+1 结算</span>
          </div>
          <button className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center space-x-0.5">
            <span>立即提现</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1 shadow-xs border border-gray-100 flex justify-between text-xs font-bold text-gray-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'overview' ? 'bg-purple-700 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          收益概览
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'team' ? 'bg-purple-700 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          下属商户/粉丝
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'commissions' ? 'bg-purple-700 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          分润明细
        </button>
        <button
          onClick={() => setActiveTab('poster')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'poster' ? 'bg-purple-700 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          拓客海报
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* PRD Rule Banner */}
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-purple-900">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>推广专员分润机制 (PRD 7.6 规范)</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              您邀请绑定的社区商户与消费用户，产生自提或配送订单时，系统将从实付商品基数中自动扣减 <span className="font-bold text-purple-900">2.0%</span> 作为专员推广收益，并在核销完成/确认送达后 T+1 自动划拨。
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400">已签约入驻商户</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-black text-gray-900 font-mono">3</span>
                <span className="text-[10px] text-gray-500">家</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">↑ 老街坊生鲜已入驻</span>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400">锁粉社区消费者</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-black text-gray-900 font-mono">128</span>
                <span className="text-[10px] text-gray-500">人</span>
              </div>
              <span className="text-[10px] text-purple-600 font-bold block">本月新增 +24 人</span>
            </div>
          </div>

          {/* Recent Orders Commission Feed */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900">实时推广奖励流水</h3>
              <span className="text-[10px] text-gray-400">实时同步</span>
            </div>

            <div className="divide-y divide-gray-50 space-y-1">
              {promoterOrders.map((o) => (
                <div key={o.orderNo} className="pt-2 pb-1 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-gray-800">{o.merchantName.split(' ')[0]}</div>
                    <span className="text-[10px] text-gray-400">订单 {o.orderNo.slice(-6)} · 实付 ¥{o.payAmount}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-purple-700 font-mono text-xs">+¥{(o.splitDetail?.promoter || 0.26).toFixed(2)}</span>
                    <span className="text-[9px] text-emerald-600 block">2%锁定</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Team & Merchants Tab */}
      {activeTab === 'team' && (
        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-gray-900 flex items-center justify-between">
              <span>我邀请签约的商户 (3家)</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">永久绑定</span>
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    老
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">老街坊果蔬生鲜超市 (绿茵路店)</h4>
                    <span className="text-[10px] text-gray-400">入驻时间：2026-08-10 · 今日 8 单</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 font-mono">+¥4.80</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    邻
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">邻家精品烘焙与冷饮坊</h4>
                    <span className="text-[10px] text-gray-400">入驻时间：2026-08-15 · 今日 4 单</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 font-mono">+¥2.20</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    百
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">百味熟食便民工坊</h4>
                    <span className="text-[10px] text-gray-400">入驻时间：2026-08-20 · 今日 2 单</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 font-mono">+¥1.10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Commissions Breakdown Tab */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="text-xs font-black text-gray-900">五方分账收益结算明细</h3>
            <span className="text-[10px] text-gray-400">依据 PRD 7.6 拆解</span>
          </div>

          <div className="space-y-2">
            {promoterOrders.map((o) => (
              <div key={o.orderNo} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900">{o.orderNo}</span>
                  <span className="text-purple-700 font-mono">+¥{(o.splitDetail?.promoter || 0.26).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>买家实付: ¥{o.payAmount} (商品基数 ¥{o.goodsAmount})</span>
                  <span className="text-emerald-600">2% 分润 = ¥{(o.splitDetail?.promoter || 0.26).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Promotion Poster & Code Tab */}
      {activeTab === 'poster' && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3.5 text-center">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-gray-900">社区商户与买家拓客二维码</h3>
            <p className="text-[10px] text-gray-400">商户扫码入驻即可永久绑定，每笔订单享 2% 延时分润</p>
          </div>

          <div className="w-44 h-44 mx-auto bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-2xl p-3 border-2 border-purple-300/60 shadow-inner flex flex-col items-center justify-center">
            <QrCode className="w-28 h-28 text-purple-900" />
            <span className="text-[10px] font-mono font-black text-purple-800 mt-1">TG-88992</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-100 transition flex items-center justify-center space-x-1"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制邀请码' : '复制邀请码'}</span>
            </button>
            <button
              onClick={() => alert('已保存拓客海报至手机相册！')}
              className="flex-1 py-2 bg-purple-700 text-white rounded-xl text-xs font-black hover:bg-purple-800 transition flex items-center justify-center space-x-1 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>保存海报发圈</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
