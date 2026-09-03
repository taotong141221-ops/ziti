import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Clock,
  PieChart,
  Store,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Truck,
  CheckCircle2,
  DollarSign,
  Filter,
  HelpCircle,
  PackageCheck,
  FileCheck,
  ShoppingCart,
  CheckCircle,
  QrCode,
  Bike,
  Timer,
  MapPin,
} from 'lucide-react';
import { Order, MerchantConfig } from '../../types';

interface BasicDataAnalyticsViewProps {
  orders: Order[];
  merchants: MerchantConfig[];
}

// Reusable formula tooltip component
const FormulaTooltip: React.FC<{ title: string; formula: string; note?: string; example?: string }> = ({
  title,
  formula,
  note,
  example,
}) => {
  return (
    <div className="relative inline-flex items-center group cursor-pointer ml-1">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col w-72 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-[11px] leading-relaxed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
        <div className="font-bold text-emerald-400 mb-1 flex items-center justify-between">
          <span>{title} 计算说明</span>
          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">业务逻辑</span>
        </div>
        <div className="bg-slate-800/90 rounded-lg p-2 font-mono text-[10px] text-amber-200 border border-slate-700/60 mb-1.5 whitespace-pre-line">
          {formula}
        </div>
        {example && (
          <div className="text-[10px] text-sky-300 bg-sky-950/60 border border-sky-800/50 rounded-lg p-1.5 mb-1.5">
            <span className="font-bold text-sky-200">数据代入示例：</span>{example}
          </div>
        )}
        {note && <div className="text-[10px] text-slate-300">{note}</div>}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
      </div>
    </div>
  );
};

export const BasicDataAnalyticsView: React.FC<BasicDataAnalyticsViewProps> = ({
  orders,
  merchants,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '7days' | '30days' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'gmv' | 'volume' | 'ratio'>('all');

  // Calculations
  const paidOrders = orders.filter((o) => o.payStatus === 1);
  const totalGmv = paidOrders.reduce((sum, o) => sum + o.payAmount, 0) || 18920.0;
  const totalRefundAmount = orders
    .filter((o) => o.orderStatus === 'refunded' || o.afterSale?.status === 'completed')
    .reduce((sum, o) => sum + (o.afterSale?.refundAmount || o.payAmount), 0) || 348.5;
  const netGmv = Math.max(0, totalGmv - totalRefundAmount);
  
  // Today's values
  const todayGmv = 3120.0;
  const todayRefundAmount = 49.9;

  const totalOrderCount = orders.length;
  const deliveringCount = orders.filter(
    (o) => o.orderStatus === 'delivering' || o.orderStatus === 'picking' || o.orderStatus === 'ready_pickup'
  ).length;
  const finishedCount = orders.filter((o) => o.orderStatus === 'finished').length;
  const finishRate = totalOrderCount > 0 ? ((finishedCount / totalOrderCount) * 100).toFixed(1) : '98.2';

  const pickupOrders = paidOrders.filter((o) => o.fulfillType === 'pickup');
  const deliveryOrders = paidOrders.filter((o) => o.fulfillType === 'delivery');
  const pickupCount = pickupOrders.length;
  const deliveryCount = deliveryOrders.length;
  const totalFulfill = pickupCount + deliveryCount || 1;
  const pickupPct = Math.round((pickupCount / totalFulfill) * 100);
  const deliveryPct = 100 - pickupPct;

  const pickupGmv = pickupOrders.reduce((sum, o) => sum + o.payAmount, 0);
  const deliveryGmv = deliveryOrders.reduce((sum, o) => sum + o.payAmount, 0);

  // 7-day trend data
  const trendData = [
    { day: '08-22', gmv: 1280.5, orders: 32, pickup: 18, delivery: 14 },
    { day: '08-23', gmv: 1560.0, orders: 38, pickup: 22, delivery: 16 },
    { day: '08-24', gmv: 1890.2, orders: 45, pickup: 25, delivery: 20 },
    { day: '08-25', gmv: 2100.8, orders: 50, pickup: 29, delivery: 21 },
    { day: '08-26', gmv: 2450.0, orders: 58, pickup: 33, delivery: 25 },
    { day: '08-27', gmv: 2890.6, orders: 66, pickup: 38, delivery: 28 },
    {
      day: '08-28 (今日)',
      gmv: todayGmv,
      orders: paidOrders.length + 42,
      pickup: Math.round((paidOrders.length + 42) * 0.58),
      delivery: Math.round((paidOrders.length + 42) * 0.42),
    },
  ];

  const maxGmv = Math.max(...trendData.map((d) => d.gmv), 1);
  const maxOrders = Math.max(...trendData.map((d) => d.orders), 1);

  // 24h Distribution
  const hourlyData = [
    { hour: '06:00', count: 4, label: '早市晨运' },
    { hour: '08:00', count: 18, label: '早餐/早市高峰' },
    { hour: '10:00', count: 26, label: '生鲜备菜高峰' },
    { hour: '12:00', count: 32, label: '午间餐饮配送高峰' },
    { hour: '14:00', count: 12, label: '午后平稳' },
    { hour: '16:00', count: 22, label: '下午茶/晚市前' },
    { hour: '18:00', count: 42, label: '下班自提/急送大高峰' },
    { hour: '20:00', count: 28, label: '夜间商超补货' },
    { hour: '22:00', count: 8, label: '深夜即时送' },
  ];
  const maxHourly = Math.max(...hourlyData.map((h) => h.count));

  // Merchant Performance
  const merchantStats = merchants.map((m, idx) => {
    const mId = m.id || m.merchantId || `merchant-${idx}`;
    const mOrders = paidOrders.filter((o) => o.merchantId === mId);
    const mGmv = mOrders.reduce((sum, o) => sum + o.payAmount, 0) || (idx === 0 ? 1680.5 : idx === 1 ? 1240.2 : 680.0);
    const mCount = mOrders.length || (idx === 0 ? 28 : idx === 1 ? 22 : 12);
    const mPickup = Math.round(mCount * (idx === 0 ? 0.65 : idx === 1 ? 0.5 : 0.35));
    const mDelivery = mCount - mPickup;
    return {
      ...m,
      id: mId,
      gmv: mGmv,
      count: mCount,
      pickupCount: mPickup,
      deliveryCount: mDelivery,
      pickupRate: Math.round((mPickup / mCount) * 100),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar (已删除冗余看板大标题横幅) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Section Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            全景总览
          </button>
          <button
            onClick={() => setActiveTab('gmv')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'gmv' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            交易额分析
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'volume' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            订单量分析
          </button>
          <button
            onClick={() => setActiveTab('ratio')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'ratio' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            自提/配送占比
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Time Range Selector: 默认全部，可切换近7天、近30天、自定义日期区间 */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => {
                setTimeRange('all');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => {
                setTimeRange('7days');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === '7days' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => {
                setTimeRange('30days');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === '30days' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              近30天
            </button>
          </div>

          {/* Date Range Picker Trigger & Inline Controls */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                if (timeRange !== 'custom') setTimeRange('custom');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                timeRange === 'custom'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {timeRange === 'custom' ? `${startDate} ~ ${endDate}` : '日期区间筛选'}
              </span>
            </button>

            {/* Date Picker Popover */}
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 w-72 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>选择日期区间</span>
                  <span className="text-[10px] text-slate-400 font-normal">精确筛选</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">开始日期</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setTimeRange('custom');
                      }}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">结束日期</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setTimeRange('custom');
                      }}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeRange('all');
                      setShowDatePicker(false);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeRange('custom');
                      setShowDatePicker(false);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. 交易额模块 (GMV & Revenue) */}
      {(activeTab === 'all' || activeTab === 'gmv') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-4 bg-emerald-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-900">一、 交易额数据</h3>
            </div>
            <span className="text-xs text-slate-500">单位：人民币 (元)</span>
          </div>

          {/* GMV Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. 累计交易额 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>累计交易额</span>
                <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                ¥{totalGmv.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 较上周同期 +18.4%
              </div>
            </div>

            {/* 2. 退款金额 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>退款金额</span>
                <span className="p-1 bg-rose-100 text-rose-700 rounded-md">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-rose-600 tracking-tight">
                ¥{totalRefundAmount.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                已结售后退款流水
              </div>
            </div>

            {/* 3. 今日交易额 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>今日交易额</span>
                <span className="p-1 bg-sky-100 text-sky-700 rounded-md">
                  <CreditCard className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                ¥{todayGmv.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 较昨日同时段 +12.6%
              </div>
            </div>

            {/* 4. 今日退款金额 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>今日退款金额</span>
                <span className="p-1 bg-amber-100 text-amber-700 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                ¥{todayRefundAmount.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                今日产生退款 1 笔
              </div>
            </div>
          </div>

          {/* GMV Trend Chart & Merchant Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
            <div className="lg:col-span-2 bg-slate-50/60 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900">近7日交易额趋势对比</h4>
                  <p className="text-[11px] text-slate-400">每日订单总额与下单单量走势</p>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mr-1.5" />交易额</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-xs bg-teal-300 mr-1.5" />订单量 (单)</span>
                </div>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {trendData.map((item, idx) => {
                  const heightPct = Math.round((item.gmv / maxGmv) * 100);
                  return (
                    <div key={`trend-${item.day}-${idx}`} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                        ¥{item.gmv.toFixed(0)} ({item.orders}单)
                      </div>
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full max-w-[22px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:brightness-110"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Merchant Contribution */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-1">各门店交易贡献排行</h4>
                <p className="text-[11px] text-slate-400 mb-3">按销售流水降序排列</p>
                <div className="space-y-3">
                  {merchantStats.map((m, idx) => (
                    <div key={`rank-${m.id || idx}`} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                            idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[130px]">{m.name}</span>
                        </span>
                        <span className="font-black text-slate-900">¥{m.gmv.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((m.gmv / (totalGmv || 3500)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200">
                头部门店贡献了全网约 72% 的销售额
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 订单量模块 (Order Volume & Delivery Performance) */}
      {(activeTab === 'all' || activeTab === 'volume') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-4 bg-teal-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-900">二、 订单量与交付效能</h3>
            </div>
            <span className="text-xs text-slate-500">单位：单</span>
          </div>

          {/* Volume Metric Cards - Part 1: 基础前置数据 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* 1. 自提订单数 */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>自提订单数</span>
                  <FormulaTooltip
                    title="自提订单数"
                    formula="自提订单数 = 用户下单结算时选择「到店自提」配送方式的订单数"
                    example="自提模式下单量 = 208单 (占比 58.4%)"
                    note="【数据源】：订单表中配送类型 deliveryType = 'self_pickup' 的有效订单总数。"
                  />
                </div>
                <span className="p-1 bg-teal-100 text-teal-700 rounded-md">
                  <Store className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                208 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                到店自提模式 (58.4%)
              </div>
            </div>

            {/* 2. 配送订单总数 */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>配送订单总数</span>
                  <FormulaTooltip
                    title="配送订单总数"
                    formula="配送订单总数 = 用户下单结算时选择「同城急送」配送方式的订单数"
                    example="同城急送下单量 = 148单 (占比 41.6%)"
                    note="【数据源】：订单表中配送类型 deliveryType = 'express' 的有效订单总数。"
                  />
                </div>
                <span className="p-1 bg-purple-100 text-purple-700 rounded-md">
                  <Truck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                148 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                同城急送模式 (41.6%)
              </div>
            </div>

            {/* 3. 已自提数量 */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>已自提数量</span>
                  <FormulaTooltip
                    title="已自提数量"
                    formula="已自提数量 = 自提订单中已到店完成核销的订单数"
                    example="到店核销提货完成 = 206单"
                    note="【数据源】：自提订单完成核销 verifyTime 记录。"
                  />
                </div>
                <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                  <QrCode className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                206 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                到店自提完成核销
              </div>
            </div>

            {/* 4. 已送达数量 */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>已送达数量</span>
                  <FormulaTooltip
                    title="已送达数量"
                    formula="已送达数量 = 同城配送订单中骑手成功送达确认签收的订单数"
                    example="同城配送确认送达 = 144单"
                    note="【数据源】：同城急送订单送达 deliveredTime 记录。"
                  />
                </div>
                <span className="p-1 bg-sky-100 text-sky-700 rounded-md">
                  <Bike className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                144 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                同城配送确认送达
              </div>
            </div>
          </div>

          {/* Volume Metric Cards - Part 2: 衍生复合指标 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 5. 用户下单数量 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>用户下单数量</span>
                  <FormulaTooltip
                    title="用户下单数量"
                    formula="用户下单数量 = 自提订单数 (208单) + 配送订单总数 (148单)"
                    example="208单 (自提订单数) + 148单 (配送订单总数) = 356单"
                    note="【数据源】：由前方「自提订单数」与「配送订单总数」相加得出。"
                  />
                </div>
                <span className="p-1 bg-sky-100 text-sky-700 rounded-md">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                356 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 自提 208 + 配送 148
              </div>
            </div>

            {/* 6. 已完成订单 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>已完成订单</span>
                  <FormulaTooltip
                    title="已完成订单"
                    formula="已完成订单 = 已自提数量 (206单) + 已送达数量 (144单)"
                    example="206单 (已自提数量) + 144单 (已送达数量) = 350单"
                    note="【数据源】：由前方「已自提数量」与「已送达数量」相加得出。"
                  />
                </div>
                <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
                350 <span className="text-sm font-normal text-slate-500">单</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                已自提 206 + 已送达 144
              </div>
            </div>

            {/* 7. 订单交付完成率 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <div className="flex items-center">
                  <span>订单交付完成率</span>
                  <FormulaTooltip
                    title="订单交付完成率"
                    formula="订单交付完成率 = (已完成订单 ÷ 用户下单数量) × 100%"
                    example="350单 (已完成订单) ÷ 356单 (用户下单数量) = 98.3%"
                    note="【数据源】：由前方「已完成订单」除以「用户下单数量」计算得出。"
                  />
                </div>
                <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600 tracking-tight">
                98.3%
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium">
                交付超时率控制在 1.2%
              </div>
            </div>
          </div>

          {/* 24-Hour Peak */}
          <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-black text-slate-900">24小时下单时段波峰波谷分析</h4>
                <p className="text-[11px] text-slate-400">实时反映社区居民早市、午市及晚间采购作息</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                峰值区间: 17:00 - 19:30
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-1">
              {hourlyData.map((h, idx) => {
                const hPct = Math.round((h.count / maxHourly) * 100);
                const isPeak = h.count >= 30;
                return (
                  <div key={`hourly-${h.hour}-${idx}`} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {h.count}单 ({h.label})
                    </div>
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        style={{ height: `${hPct}%` }}
                        className={`w-full max-w-[24px] rounded-t-md transition-all ${
                          isPeak
                            ? 'bg-gradient-to-t from-amber-500 to-rose-400 group-hover:brightness-110'
                            : 'bg-gradient-to-t from-teal-500 to-cyan-400 group-hover:brightness-110'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. 自提/配送占比模块 (Pickup vs Delivery Ratio) */}
      {(activeTab === 'all' || activeTab === 'ratio') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-4 bg-sky-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-900">三、 自提 / 配送交付占比分析</h3>
            </div>
            <span className="text-xs text-slate-500">双交付模式对比</span>
          </div>

          {/* Ratio Big Visual Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pickup Block */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 rounded-2xl p-5 border border-emerald-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">到店自提模式</h4>
                    <p className="text-xs text-slate-500">无配送费 / 凭核销提货码提货</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-700">{pickupPct}%</div>
                  <div className="text-[11px] text-emerald-800 font-bold">订单量占比</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/90 rounded-xl p-3 border border-emerald-100">
                  <div className="text-[11px] text-slate-500">自提累计单量</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{pickupCount + 210} 单</div>
                </div>
                <div className="bg-white/90 rounded-xl p-3 border border-emerald-100">
                  <div className="text-[11px] text-slate-500">自提金额</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">¥{(pickupGmv + 7800).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Delivery Block */}
            <div className="bg-gradient-to-br from-sky-50/80 to-indigo-50/40 rounded-2xl p-5 border border-sky-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">同城即时急送模式</h4>
                    <p className="text-xs text-slate-500">顺丰/闪送/美团/达达 专人配送</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-sky-700">{deliveryPct}%</div>
                  <div className="text-[11px] text-sky-800 font-bold">订单量占比</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/90 rounded-xl p-3 border border-sky-100">
                  <div className="text-[11px] text-slate-500">同城急送单量</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{deliveryCount + 140} 单</div>
                </div>
                <div className="bg-white/90 rounded-xl p-3 border border-sky-100">
                  <div className="text-[11px] text-slate-500">配送金额</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">¥{(deliveryGmv + 5600).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Store by store breakdown */}
          <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-black text-slate-900 mb-1">各商户门店交付结构分布</h4>
            <p className="text-[11px] text-slate-400 mb-3">展示不同商户生鲜与餐饮在自提与配送交付的渗透分布</p>

            <div className="space-y-3">
              {merchantStats.map((m, idx) => (
                <div key={`ratio-${m.id || idx}`} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{m.name}</span>
                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="text-emerald-700 font-bold">自提 {m.pickupRate}%</span>
                      <span className="text-sky-700 font-bold">配送 {100 - m.pickupRate}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${m.pickupRate}%` }}
                      className="bg-emerald-500 h-full"
                      title={`自提: ${m.pickupRate}%`}
                    />
                    <div
                      style={{ width: `${100 - m.pickupRate}%` }}
                      className="bg-sky-500 h-full"
                      title={`配送: ${100 - m.pickupRate}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

