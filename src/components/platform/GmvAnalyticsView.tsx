import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Calendar,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Order, MerchantConfig } from '../../types';

interface GmvAnalyticsViewProps {
  orders: Order[];
  merchants: MerchantConfig[];
}

export const GmvAnalyticsView: React.FC<GmvAnalyticsViewProps> = ({ orders, merchants }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  const paidOrders = orders.filter((o) => o.payStatus === 1);
  const totalGmv = paidOrders.reduce((sum, o) => sum + o.payAmount, 0);
  const totalRefundAmount = orders
    .filter((o) => o.orderStatus === 'refunded' || o.afterSale?.status === 'completed')
    .reduce((sum, o) => sum + (o.afterSale?.refundAmount || o.payAmount), 0);
  const netGmv = Math.max(0, totalGmv - totalRefundAmount);
  const avgOrderValue = paidOrders.length > 0 ? totalGmv / paidOrders.length : 0;
  const deliveryFeeGmv = paidOrders.reduce((sum, o) => sum + o.deliveryFee, 0);

  // 7-day trend mock data aligned with real GMV
  const trendData = [
    { day: '08-22', gmv: 1280.5, orders: 32 },
    { day: '08-23', gmv: 1560.0, orders: 38 },
    { day: '08-24', gmv: 1890.2, orders: 45 },
    { day: '08-25', gmv: 2100.8, orders: 50 },
    { day: '08-26', gmv: 2450.0, orders: 58 },
    { day: '08-27', gmv: 2890.6, orders: 66 },
    { day: '08-28 (今日)', gmv: totalGmv > 0 ? totalGmv * 1.8 : 3120.0, orders: paidOrders.length + 42 },
  ];

  const maxGmv = Math.max(...trendData.map((d) => d.gmv), 1);

  return (
    <div className="space-y-6">
      {/* Top Key Financial Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>全网累计 GMV 成交额</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            ¥{totalGmv.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>同比上周期 +24.6%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>实际净成交额 (扣退款)</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 tracking-tight">
            ¥{netGmv.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">已扣除累计退款 ¥{totalRefundAmount.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>平均笔单价 (客单价 AOV)</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 tracking-tight">
            ¥{avgOrderValue.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">平均每单实付购买额</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>配送运费总流水</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 tracking-tight">
            ¥{deliveryFeeGmv.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">同城急送单均运费 ¥2.50</div>
        </div>
      </div>

      {/* GMV Trend Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <span>交易额趋势走势图分析</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              近7日交易额持续攀升，生鲜与即时餐饮复购率高
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              今日实时
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              近 7 天
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                timeRange === '30days' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              近 30 天
            </button>
          </div>
        </div>

        {/* Custom Responsive SVG & Bar Chart */}
        <div className="pt-4 space-y-3">
          <div className="h-56 w-full flex items-end justify-between gap-3 px-2 pt-6 pb-2 bg-slate-50/70 rounded-2xl border border-slate-200/70">
            {trendData.map((item, idx) => {
              const heightPercent = Math.max(15, (item.gmv / maxGmv) * 85);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Floating tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg font-mono pointer-events-none whitespace-nowrap shadow-lg z-10">
                    ¥{item.gmv.toFixed(2)} ({item.orders}单)
                  </div>

                  <div className="w-full max-w-[42px] flex flex-col items-center">
                    <span className="text-[10px] font-black text-emerald-700 mb-1 group-hover:scale-105 transition">
                      ¥{item.gmv.toFixed(0)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold mt-2 font-mono truncate max-w-full">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Merchant GMV Ranking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-black text-slate-900">社区门店销售排行与交易额占比</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4 w-12 text-center">排名</th>
                <th className="py-3 px-4">门店名称</th>
                <th className="py-3 px-4">主营类目</th>
                <th className="py-3 px-4">已付订单数</th>
                <th className="py-3 px-4">累计 GMV 销售额</th>
                <th className="py-3 px-4">全网交易额贡献占比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {merchants.map((m, index) => {
                const mOrders = orders.filter((o) => o.merchantId === m.merchantId && o.payStatus === 1);
                const mGmv = mOrders.reduce((sum, o) => sum + o.payAmount, 0);
                const sharePercent = totalGmv > 0 ? (mGmv / totalGmv) * 100 : 33.3;

                return (
                  <tr key={m.merchantId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs ${
                          index === 0
                            ? 'bg-amber-100 text-amber-800'
                            : index === 1
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={m.logo}
                          alt={m.name}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-black text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {m.merchantId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-600">{m.category}</td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">{mOrders.length} 笔</td>

                    <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                      ¥{mGmv.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.max(5, sharePercent)}%` }}
                            className="bg-emerald-600 h-full rounded-full"
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-700 w-12 text-right">
                          {sharePercent.toFixed(1)}%
                        </span>
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
