import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { Order } from '../../types';

interface OrderVolumeAnalyticsViewProps {
  orders: Order[];
}

export const OrderVolumeAnalyticsView: React.FC<OrderVolumeAnalyticsViewProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const finishedOrders = orders.filter((o) => o.orderStatus === 'finished').length;
  const activeOrders = orders.filter(
    (o) => o.orderStatus === 'delivering' || o.orderStatus === 'ready_pickup' || o.orderStatus === 'picking'
  ).length;
  const canceledRefunded = orders.filter(
    (o) => o.orderStatus === 'canceled' || o.orderStatus === 'refunded'
  ).length;

  const completionRate = totalOrders > 0 ? (finishedOrders / totalOrders) * 100 : 96.5;

  // 24-hour distribution peak simulation
  const hourlyData = [
    { hour: '07:00', orders: 12, label: '早市晨起' },
    { hour: '09:00', orders: 48, label: '生鲜买菜高峰' },
    { hour: '11:00', orders: 65, label: '午餐外卖高峰' },
    { hour: '13:00', orders: 22, label: '午后平稳' },
    { hour: '15:00', orders: 35, label: '下午茶点心' },
    { hour: '18:00', orders: 82, label: '晚高峰买菜/晚餐' },
    { hour: '20:00', orders: 45, label: '夜宵便利' },
    { hour: '22:00', orders: 18, label: '夜间小额' },
  ];

  const maxOrders = Math.max(...hourlyData.map((d) => d.orders));

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>全网订单总量</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {totalOrders} 单
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>今日环比 +18.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>正在履约中订单</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 tracking-tight">
            {activeOrders} 单
          </div>
          <div className="mt-1 text-[11px] text-slate-400">拣货/自提待核/配送中</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>订单履约完成率</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 tracking-tight">
            {completionRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">准时履约率达 99.1%</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>单均履约耗时</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 tracking-tight">
            18.5 分钟
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">优于同城大盘 22%</div>
        </div>
      </div>

      {/* Peak Hours Histogram Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>24小时全天候下单波峰波谷分析</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              每日出现明显三峰特征：早市买菜(09:00)、午市快餐(11:30)、晚市家庭下厨(18:00)
            </p>
          </div>

          <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">
            🔥 晚间 18:00 为全天最高峰 (82单/小时)
          </span>
        </div>

        <div className="pt-4">
          <div className="h-60 w-full flex items-end justify-between gap-3 px-3 pt-8 pb-3 bg-slate-50/70 rounded-2xl border border-slate-200/70">
            {hourlyData.map((item, idx) => {
              const heightPercent = Math.max(15, (item.orders / maxOrders) * 85);
              const isPeak = item.orders >= 65;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Hover tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg font-mono pointer-events-none whitespace-nowrap shadow-lg z-10 text-center">
                    <div>{item.orders} 笔订单</div>
                    <div className="text-[9px] text-slate-300">{item.label}</div>
                  </div>

                  <div className="w-full max-w-[48px] flex flex-col items-center">
                    <span
                      className={`text-[10px] font-black mb-1.5 group-hover:scale-110 transition ${
                        isPeak ? 'text-orange-600' : 'text-slate-700'
                      }`}
                    >
                      {item.orders}单
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-xs ${
                        isPeak
                          ? 'bg-gradient-to-t from-orange-600 to-amber-400'
                          : 'bg-gradient-to-t from-blue-600 to-cyan-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono font-bold mt-2 truncate">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Status Funnel Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-black text-slate-900">订单全生命周期转化与流失漏斗</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">1. 提交并支付</span>
            <span className="text-lg font-black text-slate-900">{totalOrders} 单</span>
            <span className="text-[10px] text-emerald-600 font-bold block">支付转化率 100%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">2. 商家接单备货</span>
            <span className="text-lg font-black text-slate-900">{totalOrders} 单</span>
            <span className="text-[10px] text-slate-500 font-bold block">平均耗时 3.2 分钟</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">3. 呼叫运力/出码</span>
            <span className="text-lg font-black text-slate-900">{totalOrders} 单</span>
            <span className="text-[10px] text-slate-500 font-bold block">运力响应率 99.4%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">4. 成功送达/核销</span>
            <span className="text-lg font-black text-emerald-600">
              {finishedOrders > 0 ? finishedOrders : totalOrders - 1} 单
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">好评率 99.2%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">5. 售后退款/争议</span>
            <span className="text-lg font-black text-rose-600">{canceledRefunded} 单</span>
            <span className="text-[10px] text-rose-600 font-bold block">退款率 2.1%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
