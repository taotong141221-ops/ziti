import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Store,
  QrCode,
  Package,
  ShoppingBag,
  Clock,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Undo2,
  AlertTriangle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';
import { ReturnGoodsModal } from './ReturnGoodsModal';
import { CustomDatePickerModal } from '../merchant/CustomDatePickerModal';

export type OrderFilterTab =
  | 'all'
  | 'pending_pay'
  | 'preparing'
  | 'ready'
  | 'finished'
  | 'aftersale';

export const formatPickupTimePoint = (time?: string): string => {
  if (!time) return '17:15';
  const trimmed = time.trim();
  const timePart = trimmed.includes(' ') ? trimmed.split(' ')[1] : trimmed;
  const sub = timePart.split(':');
  if (sub.length >= 2) {
    return `${sub[0].padStart(2, '0')}:${sub[1].padStart(2, '0')}`;
  }
  return timePart;
};

type ChannelFilter = 'all' | 'online' | 'offline';
type TimePreset = 'all' | 'today' | 'yesterday' | '7days' | 'custom';
type AfterSaleSubFilter = 'all' | 'ongoing' | 'refunded';

interface OrderListViewProps {
  orders: Order[];
  initialTab?: OrderFilterTab;
  onSelectOrder: (order: Order) => void;
  onGoShopping: () => void;
  onPayOrder?: (order: Order) => void;
  onDirectRefund?: (orderNo: string) => void;
  onConfirmReceived?: (orderNo: string) => void;
  onApplyAfterSale?: (order: Order) => void;
  onCancelAfterSale?: (orderNo: string) => void;
  onConfirmCustomerShipped?: (orderNo: string, trackingNo?: string, courierName?: string) => void;
}

const TAB_KEYS: OrderFilterTab[] = [
  'all',
  'pending_pay',
  'preparing',
  'ready',
  'finished',
  'aftersale',
];

export const OrderListView: React.FC<OrderListViewProps> = ({
  orders,
  initialTab = 'all',
  onSelectOrder,
  onGoShopping,
  onPayOrder,
  onDirectRefund,
  onApplyAfterSale,
  onCancelAfterSale,
  onConfirmCustomerShipped,
}) => {
  const [activeTab, setActiveTab] = useState<OrderFilterTab>(initialTab);
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [returnGoodsModalOrder, setReturnGoodsModalOrder] = useState<Order | null>(null);

  // 渠道筛选 (全部 / 线上 / 线下)
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');

  // 时间筛选 (全部 / 今日 / 昨日 / 近7日 / 自定义时间)
  const [timePreset, setTimePreset] = useState<TimePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-20');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-27');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // 售后/退款 子筛选 (全部 / 进行中 / 已退款)
  const [afterSaleSubFilter, setAfterSaleSubFilter] = useState<AfterSaleSubFilter>('all');

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const switchTab = (targetTab: OrderFilterTab) => {
    if (targetTab === activeTab) return;
    const currentIndex = TAB_KEYS.indexOf(activeTab);
    const targetIndex = TAB_KEYS.indexOf(targetTab);
    setSlideDirection(targetIndex > currentIndex ? 1 : -1);
    setActiveTab(targetTab);
  };

  const handleNextTab = () => {
    const currentIndex = TAB_KEYS.indexOf(activeTab);
    if (currentIndex < TAB_KEYS.length - 1) {
      switchTab(TAB_KEYS[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TAB_KEYS.indexOf(activeTab);
    if (currentIndex > 0) {
      switchTab(TAB_KEYS[currentIndex - 1]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;
    const elapsed = Date.now() - touchStartPos.current.time;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 800) {
      if (deltaX < 0) {
        handleNextTab();
      } else {
        handlePrevTab();
      }
    }
    touchStartPos.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || !touchStartPos.current) {
      isDragging.current = false;
      return;
    }
    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;
    const elapsed = Date.now() - touchStartPos.current.time;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 800) {
      if (deltaX < 0) {
        handleNextTab();
      } else {
        handlePrevTab();
      }
    }
    isDragging.current = false;
    touchStartPos.current = null;
  };

  // 售后/退款 各状态计数统计
  const afterSaleCounts = useMemo(() => {
    const baseList = orders.filter((order) => {
      if (channelFilter === 'online' && order.channel === 'offline') return false;
      if (channelFilter === 'offline' && order.channel !== 'offline') return false;
      const orderDate = (order.createTime || '').slice(0, 10);
      if (timePreset === 'today' && orderDate !== '2026-08-27') return false;
      if (timePreset === 'yesterday' && orderDate !== '2026-08-26') return false;
      if (timePreset === '7days' && (orderDate < '2026-08-21' || orderDate > '2026-08-27')) return false;
      if (timePreset === 'custom' && (orderDate < customStartDate || orderDate > customEndDate)) return false;
      return true;
    });

    const total = baseList.filter((o) => ['aftersale', 'refunded'].includes(o.orderStatus)).length;
    const ongoing = baseList.filter(
      (o) => o.orderStatus === 'aftersale' && o.afterSale?.status !== 'completed' && o.afterSale?.status !== 'rejected'
    ).length;
    const refunded = baseList.filter(
      (o) => o.orderStatus === 'refunded' || o.afterSale?.status === 'completed'
    ).length;

    return { total, ongoing, refunded };
  }, [orders, channelFilter, timePreset, customStartDate, customEndDate]);

  // 综合过滤：渠道 + 时间 + 状态
  const filteredOrders = orders.filter((order) => {
    // 1. 渠道过滤
    if (channelFilter === 'online' && order.channel === 'offline') return false;
    if (channelFilter === 'offline' && order.channel !== 'offline') return false;

    // 2. 时间过滤 (基准当前业务时间 2026-08-27)
    const orderDate = (order.createTime || '').slice(0, 10);
    if (timePreset === 'today') {
      if (orderDate !== '2026-08-27') return false;
    } else if (timePreset === 'yesterday') {
      if (orderDate !== '2026-08-26') return false;
    } else if (timePreset === '7days') {
      if (orderDate < '2026-08-21' || orderDate > '2026-08-27') return false;
    } else if (timePreset === 'custom') {
      if (orderDate < customStartDate || orderDate > customEndDate) return false;
    }

    // 3. 状态过滤
    if (activeTab === 'all') return true;
    if (activeTab === 'pending_pay') return order.orderStatus === 'pending_pay';
    if (activeTab === 'preparing') {
      // 待备货删掉线下，仅线上订单进入待备货
      if (order.channel === 'offline') return false;
      return order.orderStatus === 'pending_accept' || order.orderStatus === 'picking';
    }
    if (activeTab === 'ready') {
      return order.orderStatus === 'ready_pickup';
    }
    if (activeTab === 'finished') return order.orderStatus === 'finished';
    if (activeTab === 'aftersale') {
      const isAfterSaleOrRefund = order.orderStatus === 'aftersale' || order.orderStatus === 'refunded';
      if (!isAfterSaleOrRefund) return false;

      if (afterSaleSubFilter === 'ongoing') {
        return order.orderStatus === 'aftersale' && order.afterSale?.status !== 'completed';
      }
      if (afterSaleSubFilter === 'refunded') {
        return order.orderStatus === 'refunded' || order.afterSale?.status === 'completed';
      }
      return true;
    }
    return true;
  });

  const tabs: { id: OrderFilterTab; label: string; count?: number }[] = [
    {
      id: 'all',
      label: '全部',
      count: orders.length,
    },
    {
      id: 'pending_pay',
      label: '待付款',
      count: orders.filter((o) => o.orderStatus === 'pending_pay').length,
    },
    {
      id: 'preparing',
      label: '待备货',
      count: orders.filter((o) => ['pending_accept', 'picking'].includes(o.orderStatus)).length,
    },
    {
      id: 'ready',
      label: '待自提',
      count: orders.filter((o) => o.orderStatus === 'ready_pickup').length,
    },
    {
      id: 'finished',
      label: '已完成',
      count: orders.filter((o) => o.orderStatus === 'finished').length,
    },
    {
      id: 'aftersale',
      label: '售后/退款',
      count: orders.filter((o) => ['aftersale', 'refunded'].includes(o.orderStatus)).length,
    },
  ];

  const getStatusBadge = (order: Order) => {
    const { orderStatus, isOverduePickup } = order;
    switch (orderStatus) {
      case 'pending_pay':
        return (
          <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 flex items-center space-x-0.5">
            <Clock className="w-3 h-3 text-rose-500" />
            <span>待付款</span>
          </span>
        );
      case 'pending_accept':
        return (
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center space-x-0.5">
            <Package className="w-3 h-3 text-amber-500" />
            <span>待商家接单</span>
          </span>
        );
      case 'picking':
        return (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 flex items-center space-x-0.5">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            <span>拣货备货中</span>
          </span>
        );
      case 'ready_pickup':
        return isOverduePickup ? (
          <span className="text-[11px] font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/90 flex items-center space-x-0.5">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>待自提(已超时)</span>
          </span>
        ) : (
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/80 flex items-center space-x-0.5">
            <QrCode className="w-3 h-3 text-emerald-700" />
            <span>待到店自提</span>
          </span>
        );
      case 'finished':
        return (
          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/60">
            已完成
          </span>
        );
      case 'aftersale': {
        const afStatus = order.afterSale?.status;
        if (afStatus === 'approved') {
          return (
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center space-x-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>售后已同意</span>
            </span>
          );
        }
        if (afStatus === 'rejected') {
          return (
            <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80 flex items-center space-x-0.5">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>售后已驳回</span>
            </span>
          );
        }
        if (afStatus === 'completed') {
          return (
            <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 flex items-center space-x-0.5">
              <span>售后已完成</span>
            </span>
          );
        }
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 flex items-center space-x-0.5">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>售后待审核</span>
          </span>
        );
      }
      case 'refunded':
        return (
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            已退款
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            已取消
          </span>
        );
      default:
        return <span className="text-[11px] text-gray-400">{orderStatus}</span>;
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden select-none">
      {/* 1. Status Filter Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-2xs shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center px-2 py-1.5 space-x-1 min-w-max relative">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                onClick={() => switchTab(tab.id)}
                className={`py-1.5 px-3 rounded-xl text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center space-x-1 relative ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 font-black shadow-2xs border border-emerald-200/70'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50'
                }`}
                id={`tab-order-status-${tab.id}`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Filter Bar: 渠道类型 + 时间快捷选项 (严格符合用户截图) */}
      <div className="bg-white mx-3.5 mt-2.5 mb-1 rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-2.5">
        {/* 第一行：渠道类型 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
            <Store className="w-4 h-4 text-[#00B578]" />
            <span className="text-gray-900 font-black text-xs">渠道类型</span>
          </div>
          <div className="flex items-center bg-gray-50/90 p-0.5 rounded-full border border-gray-100">
            {(
              [
                { id: 'all', label: '全部' },
                { id: 'online', label: '线上' },
                { id: 'offline', label: '线下' },
              ] as const
            ).map((item) => {
              const active = channelFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setChannelFilter(item.id)}
                  className={`px-3 py-0.5 rounded-full text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[#00B578] font-black shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 细分隔线 */}
        <div className="border-t border-gray-100/70" />

        {/* 第二行：时间筛选选项 */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {(
            [
              { id: 'all', label: '全部' },
              { id: 'today', label: '今日' },
              { id: 'yesterday', label: '昨日' },
              { id: '7days', label: '近7日' },
            ] as const
          ).map((preset) => {
            const active = timePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setTimePreset(preset.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#00B578] text-white font-black shadow-xs'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 font-medium'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          {/* 自定义时间按钮 */}
          <button
            onClick={() => {
              setTimePreset('custom');
              setShowDatePicker(true);
            }}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              timePreset === 'custom'
                ? 'bg-[#00B578] text-white font-black shadow-xs'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 font-medium'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {timePreset === 'custom'
                ? `${customStartDate.slice(5)}~${customEndDate.slice(5)}`
                : '自定义时间'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </div>

      {/* 2.5 售后/退款专属子筛选 (进行中 / 已退款) */}
      {activeTab === 'aftersale' && (
        <div className="bg-[#F8FAF9] px-4 py-2 border-b border-gray-100 flex items-center space-x-2">
          {[
            { id: 'all' as AfterSaleSubFilter, label: '全部', count: afterSaleCounts.total },
            { id: 'ongoing' as AfterSaleSubFilter, label: '进行中', count: afterSaleCounts.ongoing },
            { id: 'refunded' as AfterSaleSubFilter, label: '已退款', count: afterSaleCounts.refunded },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setAfterSaleSubFilter(sub.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                afterSaleSubFilter === sub.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}
              id={`aftersale-subtab-${sub.id}`}
            >
              <span>{sub.label}</span>
              {sub.count !== undefined && sub.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    afterSaleSubFilter === sub.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sub.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. Order List */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-24 touch-pan-y"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${afterSaleSubFilter}-${channelFilter}-${timePreset}-${customStartDate}-${customEndDate}`}
            initial={{ opacity: 0, x: slideDirection * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideDirection * 30 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-3"
          >
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3 mt-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="text-sm font-black text-gray-800">
                  暂无符合条件的订单
                </p>
                <p className="text-xs text-gray-400">可调整筛选条件或去附近商圈挑选优质商品</p>
                <button
                  onClick={onGoShopping}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  去门店逛逛
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const discountVal = order.rebateDiscount || order.pointDeductAmount || 0;

                // 线下订单卡片 (与用户提供的参考图完全一致：门头方图 + 门店名称 + 时间 + 订单金额 + 优惠金额)
                if (order.channel === 'offline') {
                  return (
                    <div
                      key={order.orderNo}
                      onClick={() => onSelectOrder(order)}
                      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:shadow-md transition cursor-pointer space-y-3"
                      id={`order-card-offline-${order.orderNo}`}
                    >
                      {/* 顶部：门头方图 + 门店名称 + 交易时间点 */}
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={
                            order.merchantDoorImage ||
                            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80'
                          }
                          alt={order.merchantName}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-black text-gray-900 truncate">
                            {order.merchantName}
                          </h3>
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {order.createTime || '2026-05-22 01:38:56'}
                          </div>
                        </div>
                      </div>

                      {/* 分割线 */}
                      <div className="border-t border-gray-100 my-1" />

                      {/* 底部两端：订单金额 与 优惠金额 (参考图标准) */}
                      <div className="flex items-center justify-between text-sm pt-0.5">
                        <div className="text-gray-500 font-normal">
                          订单金额：
                          <span className="text-gray-900 font-bold font-mono">
                            ¥ {order.goodsAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-gray-500 font-normal">
                          优惠金额：
                          <span className="text-[#00B578] font-bold font-mono">
                            -{(order.rebateDiscount || order.pointDeductAmount || 10.0).toFixed(2)} PV
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 线上订单卡片 (包含时间点自提、商品列表、状态徽章与操作按钮)
                return (
                  <div
                    key={order.orderNo}
                    onClick={() => onSelectOrder(order)}
                    className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs hover:shadow-md transition cursor-pointer space-y-3"
                    id={`order-card-${order.orderNo}`}
                  >
                    {/* Header: Merchant info with door image */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        {order.merchantDoorImage ? (
                          <img
                            src={order.merchantDoorImage}
                            alt={order.merchantName}
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4" />
                          </span>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-gray-900 truncate">
                            {order.merchantName}
                          </span>
                          <div className="mt-0.5 flex items-center">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                order.channel === 'offline'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200/70'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200/70'
                              }`}
                            >
                              {order.channel === 'offline' ? '线下' : '线上'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(order)}
                    </div>

                    {/* Scheduled Pickup Time Point (已退款状态去掉自提时间展示) */}
                    {order.orderStatus !== 'refunded' && (order.selectedPickupTime || order.createTime) && (
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1 text-emerald-900">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold">
                            自提时间: {formatPickupTimePoint(order.selectedPickupTime || order.createTime)}
                          </span>
                        </div>
                        {order.isOverduePickup && order.orderStatus === 'ready_pickup' && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 text-[10px]">
                            已超时
                          </span>
                        )}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.skuId} className="flex space-x-3">
                          <img
                            src={item.imageSnapshot}
                            alt={item.titleSnapshot}
                            className="w-13 h-13 rounded-xl object-cover bg-gray-50 shrink-0 border border-gray-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div className="text-xs font-bold text-gray-800 truncate">
                              {item.titleSnapshot}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              {item.specSnapshot}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800">
                                ¥{item.priceSnapshot.toFixed(2)}
                              </span>
                              <span className="text-gray-400 font-medium">x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 财务与金额明细 (严格符合用户图2规范) */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-50 text-xs gap-y-1">
                      <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                        <span>
                          订单金额: <strong className="text-gray-800 font-bold">¥{order.goodsAmount.toFixed(2)}</strong>
                        </span>
                        {discountVal > 0 && (
                          <span className="text-amber-600 font-bold">
                            优惠: -¥{discountVal.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 ml-auto">
                        <span className="text-gray-500 text-[11px]">
                          {order.payStatus === 0 ? '应付金额:' : '实付款:'}
                        </span>
                        <span className="font-black text-rose-600 text-sm">
                          ¥{order.payAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-1.5 flex items-center justify-end space-x-2 text-xs">
                      {/* 待付款 */}
                      {order.orderStatus === 'pending_pay' && (
                        <>
                          {onDirectRefund && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDirectRefund(order.orderNo);
                              }}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-bold rounded-xl border border-gray-200 transition cursor-pointer"
                              id={`btn-cancel-pending-pay-${order.orderNo}`}
                            >
                              取消订单
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onPayOrder) onPayOrder(order);
                              else onSelectOrder(order);
                            }}
                            className="px-3.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] text-white text-[11px] font-black rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                            id={`btn-pay-${order.orderNo}`}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>立即付款</span>
                          </button>
                        </>
                      )}

                      {/* 待备货: 直接退款 */}
                      {['pending_accept', 'picking'].includes(order.orderStatus) && onDirectRefund && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDirectRefund(order.orderNo);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                          id={`btn-refund-preparing-${order.orderNo}`}
                        >
                          申请退款
                        </button>
                      )}

                      {/* 待自提: 申请退款 (超时扣10%服务费) + 查看自提码 */}
                      {order.orderStatus === 'ready_pickup' && (
                        <>
                          {onApplyAfterSale && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApplyAfterSale(order);
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                              id={`btn-apply-aftersale-pickup-${order.orderNo}`}
                            >
                              申请售后
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrder(order);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                            id={`btn-pickup-code-${order.orderNo}`}
                          >
                            <QrCode className="w-3 h-3" />
                            <span>查看自提码</span>
                          </button>
                        </>
                      )}

                      {/* 售后中 */}
                      {order.orderStatus === 'aftersale' && (
                        <>
                          {order.afterSale?.status === 'rejected' && onApplyAfterSale && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApplyAfterSale(order);
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-xl border border-amber-200 transition cursor-pointer flex items-center space-x-1"
                              id={`btn-reapply-aftersale-${order.orderNo}`}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>重新申请</span>
                            </button>
                          )}

                          {onCancelAfterSale && order.afterSale?.status === 'pending' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelAfterSale(order.orderNo);
                              }}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl border border-gray-200 transition cursor-pointer flex items-center space-x-1"
                              id={`btn-cancel-aftersale-${order.orderNo}`}
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>撤销申请</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Date Picker Modal */}
      <CustomDatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        startDate={customStartDate}
        endDate={customEndDate}
        onConfirm={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
          setTimePreset('custom');
        }}
      />

      {/* Return Goods Modal */}
      <ReturnGoodsModal
        order={returnGoodsModalOrder}
        isOpen={!!returnGoodsModalOrder}
        onClose={() => setReturnGoodsModalOrder(null)}
        onConfirm={(orderNo, trackingNo, courierName) => {
          if (onConfirmCustomerShipped) {
            onConfirmCustomerShipped(orderNo, trackingNo, courierName);
          }
        }}
      />
    </div>
  );
};
