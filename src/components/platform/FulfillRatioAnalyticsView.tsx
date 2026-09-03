import React from 'react';
import {
  PieChart as PieIcon,
  Store,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { Order, MerchantConfig } from '../../types';

interface FulfillRatioAnalyticsViewProps {
  orders: Order[];
  merchants: MerchantConfig[];
}

export const FulfillRatioAnalyticsView: React.FC<FulfillRatioAnalyticsViewProps> = ({
  orders,
  merchants,
}) => {
  const pickupOrders = orders.filter((o) => o.fulfillType === 'pickup');
  const deliveryOrders = orders.filter((o) => o.fulfillType === 'delivery');

  const totalCount = orders.length || 1;
  const pickupCount = pickupOrders.length;
  const deliveryCount = deliveryOrders.length;

  const pickupPercent = ((pickupCount / totalCount) * 100).toFixed(1);
  const deliveryPercent = ((deliveryCount / totalCount) * 100).toFixed(1);

  const pickupGmv = pickupOrders.reduce((sum, o) => sum + o.payAmount, 0);
  const deliveryGmv = deliveryOrders.reduce((sum, o) => sum + o.payAmount, 0);
  const totalGmv = pickupGmv + deliveryGmv || 1;

  const pickupGmvPercent = ((pickupGmv / totalGmv) * 100).toFixed(1);
  const deliveryGmvPercent = ((deliveryGmv / totalGmv) * 100).toFixed(1);

  const pickupAov = pickupCount > 0 ? pickupGmv / pickupCount : 0;
  const deliveryAov = deliveryCount > 0 ? deliveryGmv / deliveryCount : 0;

  return (
    <div className="space-y-6">
      {/* Top 2 Primary Ratio Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-xs">
                📍 履约模式 A
              </span>
              <h3 className="text-xl font-black">到店自提模式 (In-Store Pickup)</h3>
            </div>
            <span className="p-2 bg-white/10 rounded-2xl">
              <Store className="w-6 h-6 text-white" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
            <div>
              <span className="text-[10px] text-emerald-100 block">自提订单数</span>
              <span className="text-xl font-black">{pickupCount} 单</span>
              <span className="text-[10px] text-emerald-200 block">占比 {pickupPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">自提销售额</span>
              <span className="text-xl font-black">¥{pickupGmv.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-200 block">占比 {pickupGmvPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">单均客单价</span>
              <span className="text-xl font-black">¥{pickupAov.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-200 block">免运费 0成本</span>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-xs">
                🛵 履约模式 B
              </span>
              <h3 className="text-xl font-black">同城急送配送 (Instant Delivery)</h3>
            </div>
            <span className="p-2 bg-white/10 rounded-2xl">
              <Truck className="w-6 h-6 text-white" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
            <div>
              <span className="text-[10px] text-blue-100 block">配送订单数</span>
              <span className="text-xl font-black">{deliveryCount} 单</span>
              <span className="text-[10px] text-blue-200 block">占比 {deliveryPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-100 block">配送销售额</span>
              <span className="text-xl font-black">¥{deliveryGmv.toFixed(2)}</span>
              <span className="text-[10px] text-blue-200 block">占比 {deliveryGmvPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-100 block">单均客单价</span>
              <span className="text-xl font-black">¥{deliveryAov.toFixed(2)}</span>
              <span className="text-[10px] text-blue-200 block">含配送费¥2.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Donut Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-emerald-600" />
          <span>全网履约方式占比与结构透视</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual SVG Donut simulation */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Delivery Arc (Blue) */}
                <path
                  className="text-blue-600"
                  strokeDasharray={`${deliveryPercent}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Pickup Arc (Emerald) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${pickupPercent}, 100`}
                  strokeDashoffset={`-${deliveryPercent}`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold">总履约单量</span>
                <span className="text-xl font-black text-slate-900">{totalCount} 笔</span>
                <span className="text-[10px] text-emerald-600 font-bold">双轨并驱</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700">到店自提 ({pickupPercent}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-bold text-slate-700">同城急送 ({deliveryPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Analytical Takeaways */}
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1">
              <h4 className="font-black text-emerald-900 flex items-center space-x-1.5">
                <Store className="w-4 h-4" />
                <span>社区自提优势分析</span>
              </h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                自提订单免去同城配送费用，为消费者提供了随时到店提货的便利，同时为线下实体门店带来了高转化率的到店二次连带消费。
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1">
              <h4 className="font-black text-blue-900 flex items-center space-x-1.5">
                <Truck className="w-4 h-4" />
                <span>即时急送增量分析</span>
              </h4>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                通过微信物流助手与支付宝达达对接，同城3公里范围内平均25分钟极速送达，大幅拓宽了门店服务半径至周边3~5个住宅小区。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Level Pickup vs Delivery Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-black text-slate-900">各门店自提 vs 配送结构分布</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">门店名称</th>
                <th className="py-3 px-4">到店自提单数</th>
                <th className="py-3 px-4">同城急送单数</th>
                <th className="py-3 px-4">自提比例</th>
                <th className="py-3 px-4">配送比例</th>
                <th className="py-3 px-4">履约结构条</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {merchants.map((m) => {
                const mOrders = orders.filter((o) => o.merchantId === m.merchantId);
                const mPickup = mOrders.filter((o) => o.fulfillType === 'pickup').length;
                const mDelivery = mOrders.filter((o) => o.fulfillType === 'delivery').length;
                const mTotal = mOrders.length || 1;
                const pRatio = Math.round((mPickup / mTotal) * 100);
                const dRatio = 100 - pRatio;

                return (
                  <tr key={m.merchantId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-black text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{mPickup} 单</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{mDelivery} 单</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{pRatio}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{dRatio}%</td>
                    <td className="py-3.5 px-4">
                      <div className="w-36 h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                        <div style={{ width: `${pRatio}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${dRatio}%` }} className="bg-blue-600 h-full" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
