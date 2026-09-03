import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  RefreshCw,
  Undo2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Phone,
  User,
  Package,
  FileText,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Send,
  X,
  Store,
  Calendar,
  ChevronDown,
  Filter,
  Check,
  Eye,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, AfterSaleInfo } from '../../types';
import { speakText, playChime } from '../../utils/audio';

// 3 Major Aftersale Classifications: 退款 (Refund), 换货 (Exchange), 退货 (Return)
export type AfterSaleCategory = 'all' | 'refund' | 'exchange' | 'return';

// Lifecycle Statuses: 待审核, 待退款, 已驳回, 已完成, 进行中, 已退款
export type AfterSaleStatusFilter =
  | 'all'
  | 'in_progress'
  | 'refunded'
  | 'pending'
  | 'waiting_refund'
  | 'rejected'
  | 'completed';

// 时间预设筛选
export type AfterSaleTimePreset = 'all' | 'today' | '7days' | '30days' | 'custom';

interface MerchantAfterSalesViewProps {
  orders: Order[];
  merchantId?: string;
  onApproveAfterSale: (orderNo: string) => void;
  onRejectAfterSale: (orderNo: string, reason: string) => void;
  onConfirmCustomerShipped: (orderNo: string, trackingNo?: string) => void;
  onConfirmReceivedAndRefund: (orderNo: string) => void;
  onShowToast: (msg: string) => void;
}

export const MerchantAfterSalesView: React.FC<MerchantAfterSalesViewProps> = ({
  orders,
  merchantId,
  onApproveAfterSale,
  onRejectAfterSale,
  onConfirmCustomerShipped,
  onConfirmReceivedAndRefund,
  onShowToast,
}) => {
  // Category Tab: 'all' | 'refund' (退款) | 'exchange' (换货) | 'return' (退货)
  const [selectedCategory, setSelectedCategory] = useState<AfterSaleCategory>('all');

  // Status Filter: 'all' | 'pending' | 'waiting_customer_ship' | 'customer_shipped' | 'completed' | 'rejected'
  const [statusFilter, setStatusFilter] = useState<AfterSaleStatusFilter>('all');

  // 时间范围筛选 (弹窗控制 + 时间状态)
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [timePreset, setTimePreset] = useState<AfterSaleTimePreset>('all');
  const [tempTimePreset, setTempTimePreset] = useState<AfterSaleTimePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-27');
  const [tempStartDate, setTempStartDate] = useState<string>('2026-08-01');
  const [tempEndDate, setTempEndDate] = useState<string>('2026-08-27');

  // Keyword search
  const [keyword, setKeyword] = useState<string>('');

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('商品已拆封影响二次销售');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  // After-sale Detail Modal State
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Extract all orders that have after-sales request or are in aftersale/refunded status
  const afterSaleOrders = useMemo(() => {
    return orders.filter((o) => {
      // If merchantId is provided, filter by merchantId
      if (merchantId && o.merchantId && o.merchantId !== merchantId) {
        return false;
      }
      return o.orderStatus === 'aftersale' || o.orderStatus === 'refunded' || !!o.afterSale;
    });
  }, [orders, merchantId]);

  // Normalize category helper
  const getNormalizedType = (order: Order): 'refund' | 'exchange' | 'return' => {
    const rawType = order.afterSale?.type;
    if (rawType === 'exchange') return 'exchange';
    if (rawType === 'return' || rawType === 'partial_refund') return 'return';
    return 'refund'; // default only refund / full_refund
  };

  // Helper to check time filter
  const checkTimeFilter = (order: Order): boolean => {
    if (timePreset === 'all') return true;
    const timeStr = order.afterSale?.applyTime || order.createTime;
    if (!timeStr) return true;

    const parts = timeStr.trim().split(' ')[0].split('-');
    if (parts.length === 3) {
      const orderYear = parseInt(parts[0], 10);
      const orderMonth = parseInt(parts[1], 10) - 1;
      const orderDay = parseInt(parts[2], 10);
      const orderDate = new Date(orderYear, orderMonth, orderDay);
      
      if (timePreset === 'custom') {
        const orderDateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
        return true;
      }

      // Compare relative to baseline 2026-08-27
      const baseDate = new Date(2026, 7, 27);
      const diffMs = baseDate.getTime() - orderDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (timePreset === 'today') {
        return diffDays <= 0 || (orderYear === 2026 && orderMonth === 7 && orderDay >= 26);
      }
      if (timePreset === '7days') {
        return diffDays <= 7;
      }
      if (timePreset === '30days') {
        return diffDays <= 30;
      }
    }
    return true;
  };

  // Filtered List
  const filteredOrders = useMemo(() => {
    return afterSaleOrders.filter((order) => {
      const type = getNormalizedType(order);
      const afterSale = order.afterSale;
      const currentStatus = afterSale?.status || (order.orderStatus === 'refunded' ? 'completed' : 'pending');

      // 1. Category Filter: 退款, 换货, 退货
      if (selectedCategory !== 'all' && type !== selectedCategory) {
        return false;
      }

      // 2. Time Filter
      if (!checkTimeFilter(order)) {
        return false;
      }

      // 3. Status Filter: 全部 | 进行中 | 已退款 | 待审核 | 已驳回
      if (statusFilter !== 'all') {
        if (statusFilter === 'in_progress') {
          if (
            currentStatus !== 'pending' &&
            currentStatus !== 'approved' &&
            currentStatus !== 'waiting_customer_ship' &&
            currentStatus !== 'customer_shipped' &&
            order.orderStatus !== 'aftersale'
          ) {
            return false;
          }
        } else if (statusFilter === 'refunded' || statusFilter === 'completed') {
          if (currentStatus !== 'completed' && order.orderStatus !== 'refunded') {
            return false;
          }
        } else if (statusFilter === 'pending') {
          if (currentStatus !== 'pending') return false;
        } else if (statusFilter === 'waiting_refund') {
          if (
            currentStatus !== 'approved' &&
            currentStatus !== 'waiting_customer_ship' &&
            currentStatus !== 'customer_shipped'
          ) {
            return false;
          }
        } else if (statusFilter === 'rejected') {
          if (currentStatus !== 'rejected') return false;
        }
      }

      // 4. Keyword Search
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchOrderNo = order.orderNo.toLowerCase().includes(kw);
        const matchCustomer = (order.fulfillment?.receiverName || '').toLowerCase().includes(kw);
        const matchPhone = (order.fulfillment?.receiverPhone || '').includes(kw);
        const matchGoods = order.items.some((item) =>
          item.titleSnapshot.toLowerCase().includes(kw)
        );
        const matchReason = (order.aftersaleReason || afterSale?.reason || '')
          .toLowerCase()
          .includes(kw);
        return matchOrderNo || matchCustomer || matchPhone || matchGoods || matchReason;
      }

      return true;
    });
  }, [afterSaleOrders, selectedCategory, timePreset, customStartDate, customEndDate, statusFilter, keyword]);

  // Handler: Merchant Approve
  const handleApprove = (order: Order) => {
    const isPickup = order.fulfillType === 'pickup' || order.fulfillment?.fulfillType === 'pickup';
    const type = getNormalizedType(order);
    onApproveAfterSale(order.orderNo);
    playChime();
    if (isPickup) {
      speakText('自提到店售后审核通过，已直接完成退款或换货！');
      onShowToast(`已同意订单 ${order.orderNo} 售后申请，自提已退款/完成换货！`);
    } else if (type === 'refund') {
      speakText('审核通过，已直接原路退款给消费者！');
      onShowToast(`已同意订单 ${order.orderNo} 仅退款申请，款项已原路退回！`);
    } else if (type === 'return') {
      speakText('审核通过，等待买家退回商品！');
      onShowToast(`已同意订单 ${order.orderNo} 退货申请，等待买家退回商品`);
    } else {
      speakText('审核通过，已通知消费者换货！');
      onShowToast(`已同意订单 ${order.orderNo} 换货申请，等待买家换货`);
    }
  };

  // Handler: Confirm Received & Refund (收到退货并退款)
  const handleConfirmReceived = (order: Order) => {
    onConfirmReceivedAndRefund(order.orderNo);
    playChime();
    const type = getNormalizedType(order);
    if (type === 'exchange') {
      speakText('已收到退回商品，换货处理完成！');
      onShowToast(`已确认收到换货退件，换货履约完成！`);
    } else {
      speakText('已确认收货，退款已打款完成！');
      onShowToast(`已确认收到退货，款项已原路退还至消费者账户！`);
    }
  };

  // Time label display
  const getTimeFilterLabel = () => {
    if (timePreset === 'all') return '全部时间';
    if (timePreset === 'today') return '今日';
    if (timePreset === '7days') return '近7天';
    if (timePreset === '30days') return '近30天';
    if (timePreset === 'custom') {
      return `${customStartDate ? customStartDate.slice(5) : ''} ~ ${customEndDate ? customEndDate.slice(5) : ''}`;
    }
    return '时间筛选';
  };

  // Quick Reject Reasons
  const REJECT_REASONS = [
    '商品已拆封使用，影响二次销售',
    '已超过售后处理时限(生鲜超24小时)',
    '未提供商品变质/破损有效凭证',
    '买家个人原因拍错/不想要',
    '已与买家协商一致线下调换',
  ];

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden relative">
      {/* 1. Top Status Selector Tabs & Multi-Dimensional Filters (参考图2精美排版) */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2.5 shrink-0 space-y-2.5 shadow-2xs">
        {/* Row 1: 文本风格主状态导航选项卡 (字体小巧精致) */}
        <div className="flex items-center justify-between border-b border-gray-100/80 pb-1">
          {[
            { id: 'all', label: '全部', count: afterSaleOrders.length },
            {
              id: 'in_progress',
              label: '进行中',
              count: afterSaleOrders.filter((o) => {
                const s = o.afterSale?.status || (o.orderStatus === 'aftersale' ? 'pending' : '');
                return (
                  s === 'pending' ||
                  s === 'approved' ||
                  s === 'waiting_customer_ship' ||
                  s === 'customer_shipped' ||
                  o.orderStatus === 'aftersale'
                );
              }).length,
            },
            {
              id: 'refunded',
              label: '已退款',
              count: afterSaleOrders.filter((o) => {
                const s = o.afterSale?.status || (o.orderStatus === 'refunded' ? 'completed' : '');
                return s === 'completed' || o.orderStatus === 'refunded';
              }).length,
            },
            {
              id: 'pending',
              label: '待审核',
              count: afterSaleOrders.filter((o) => {
                const s = o.afterSale?.status || (o.orderStatus === 'aftersale' ? 'pending' : '');
                return s === 'pending';
              }).length,
            },
            {
              id: 'rejected',
              label: '已驳回',
              count: afterSaleOrders.filter((o) => {
                const s = o.afterSale?.status;
                return s === 'rejected';
              }).length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as AfterSaleStatusFilter)}
                className="flex flex-col items-center justify-center cursor-pointer relative py-0.5 px-1.5 group transition"
                id={`tab-aftersales-status-${tab.id}`}
              >
                <div className="flex items-center space-x-0.5">
                  <span
                    className={`text-xs tracking-tight transition ${
                      isActive
                        ? 'font-black text-[#00B578]'
                        : 'font-semibold text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[8.5px] px-1 py-0.2 rounded-full font-bold leading-none ${
                        isActive
                          ? 'bg-[#00B578] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>

                {/* Active Underline Indicator */}
                {isActive ? (
                  <div className="w-4 h-0.5 bg-[#00B578] rounded-full mt-1 animate-in fade-in zoom-in duration-200" />
                ) : (
                  <div className="w-4 h-0.5 bg-transparent rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2 (图2第二行): 胶囊按钮筛选 (全部类型, 仅退款, 换货, 退货) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: '全部类型' },
            { id: 'refund', label: '仅退款' },
            { id: 'exchange', label: '换货' },
            { id: 'return', label: '退货' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as AfterSaleCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-[#00B578] border border-emerald-300/80 shadow-2xs font-black'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 border border-transparent'
                }`}
                id={`cat-btn-${cat.id}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Time Filter Button */}
        <div className="flex items-center space-x-2 pt-0.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索订单号 / 姓名 / 手机 / 商品..."
              className="w-full pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 时间范围筛选按钮 (触发弹窗展示) */}
          <button
            type="button"
            onClick={() => {
              setTempTimePreset(timePreset);
              setTempStartDate(customStartDate);
              setTempEndDate(customEndDate);
              setShowTimeModal(true);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition shrink-0 cursor-pointer ${
              timePreset !== 'all'
                ? 'bg-emerald-50 text-[#00B578] border-emerald-300 font-black'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
            id="btn-open-time-filter"
          >
            <Calendar className="w-3.5 h-3.5 text-[#00B578]" />
            <span>{getTimeFilterLabel()}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 3. After-sales Orders List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-gray-100 shadow-2xs my-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#00B578] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">暂无符合条件的售后订单</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              当前筛选条件下暂无售后退款、换货或退货申请
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const type = getNormalizedType(order);
            const afterSale = order.afterSale;
            const currentStatus =
              afterSale?.status || (order.orderStatus === 'refunded' ? 'completed' : 'pending');
            const isPickup =
              order.fulfillType === 'pickup' || order.fulfillment?.fulfillType === 'pickup';

            // Format type badge color
            const typeBadgeConfig = {
              refund: {
                label: '仅退款',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: DollarSign,
              },
              exchange: {
                label: '申请换货',
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: RefreshCw,
              },
              return: {
                label: '退货退款',
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
                icon: Undo2,
              },
            }[type];

            const TypeIcon = typeBadgeConfig.icon;

            return (
              <div
                key={order.orderNo}
                onClick={() => setSelectedDetailOrder(order)}
                className="bg-white rounded-2xl p-3.5 border border-gray-200/80 hover:border-emerald-300 shadow-2xs space-y-3 relative overflow-hidden cursor-pointer transition group"
              >
                {/* 
                  Order Top Bar:
                  - 左侧：单号
                  - 右侧：仅退款/换货/退货 标签 + 当前状态标签
                */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black text-gray-800">
                      单号: {order.orderNo}
                    </span>
                  </div>

                  {/* 仅退款/换货/退货 标签 + 状态 */}
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black border ${typeBadgeConfig.bg} ${typeBadgeConfig.text} ${typeBadgeConfig.border}`}
                    >
                      <TypeIcon className="w-2.5 h-2.5" />
                      <span>{typeBadgeConfig.label}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        currentStatus === 'pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : currentStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : currentStatus === 'rejected'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {currentStatus === 'pending'
                        ? '待商家审核'
                        : currentStatus === 'completed'
                        ? '已完成'
                        : currentStatus === 'rejected'
                        ? '已驳回'
                        : '处理中'}
                    </span>
                  </div>
                </div>

                {/* 
                  Goods Snapshot List (紧凑商品展示)
                */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 p-2 bg-gray-50/60 rounded-xl border border-gray-100"
                    >
                      <img
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-gray-900 truncate">
                          {item.titleSnapshot}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                          <span className="truncate">规格: {item.specSnapshot || '标准份'}</span>
                          <span
                            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-black border shrink-0 ml-1 ${
                              isPickup
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isPickup ? (
                              <Store className="w-2.5 h-2.5 text-[#00B578]" />
                            ) : (
                              <Truck className="w-2.5 h-2.5 text-blue-600" />
                            )}
                            <span>{isPickup ? '到店自提' : '同城配送'}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-gray-900 font-sans">
                            ¥{(item.priceSnapshot || 0).toFixed(2)}
                          </span>
                          <span className="text-[11px] text-gray-400 font-sans">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 简明售后诉求摘要条 */}
                <div className="bg-gray-50/80 px-2.5 py-2 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-600 truncate mr-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">
                      {type === 'exchange'
                        ? `换货诉求: ${afterSale?.exchangeSpec || '更换规格'}`
                        : `原因: ${order.aftersaleReason || afterSale?.reason || '申请退款'}`}
                    </span>
                  </div>
                  {type !== 'exchange' && (
                    <div className="shrink-0 flex items-center space-x-1 text-xs">
                      <span className="text-gray-500 text-[11px]">退款:</span>
                      <span className="font-black text-rose-600 font-sans text-sm">
                        ¥{(afterSale?.refundAmount || order.payAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations & Action Buttons */}
                <div className="pt-1 flex items-center justify-between">
                  {/* 查看详情按钮：点击整个按钮可查看详情 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailOrder(order);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#00B578] font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                    id={`btn-view-detail-${order.orderNo}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>查看详情</span>
                  </button>

                  {/* 状态操作按钮 */}
                  <div className="flex items-center space-x-2">
                    {/* Status 1: 待商家审核 */}
                    {currentStatus === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectModalOrder(order);
                            setCustomRejectReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                          id={`btn-reject-aftersale-${order.orderNo}`}
                        >
                          拒绝申请
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(order);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1"
                          id={`btn-approve-aftersale-${order.orderNo}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isPickup
                              ? type === 'exchange'
                                ? '同意换货'
                                : '同意退款'
                              : '审核通过'}
                          </span>
                        </button>
                      </>
                    )}

                    {/* Status 2: 审核通过，等待退回 (配送订单) */}
                    {(currentStatus === 'approved' || currentStatus === 'waiting_customer_ship') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmReceived(order);
                        }}
                        className="px-3.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl text-xs font-black cursor-pointer transition shadow-xs flex items-center space-x-1"
                        id={`btn-direct-refund-${order.orderNo}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{type === 'exchange' ? '确认换货' : '确认退款'}</span>
                      </button>
                    )}

                    {/* Status 3: 买家已退回，待商家确认退款 */}
                    {currentStatus === 'customer_shipped' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmReceived(order);
                        }}
                        className="px-3.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl text-xs font-black cursor-pointer transition shadow-xs flex items-center space-x-1"
                        id={`btn-confirm-refund-${order.orderNo}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {type === 'exchange' ? '验货并换货' : '验货并退款'}
                        </span>
                      </button>
                    )}

                    {/* Status 4: 已完成 */}
                    {currentStatus === 'completed' && (
                      <span className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00B578]" />
                        <span>{type === 'exchange' ? '换货完成' : '退款完成'}</span>
                      </span>
                    )}

                    {/* Status 5: 已拒绝 */}
                    {currentStatus === 'rejected' && (
                      <span className="text-xs text-rose-700 font-bold flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>已驳回</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 
        时间范围筛选弹窗 (支持「全部时间」、「今日」、「近7天」、「近30天」以及「自定义时间区间」)
      */}
      <AnimatePresence>
        {showTimeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2 font-black text-sm text-gray-900">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B578] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>售后时间范围筛选</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 快捷时间预设 */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-800">
                  快捷时间选择
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: '全部时间' },
                    { id: 'today', label: '今日售后' },
                    { id: '7days', label: '近7天记录' },
                    { id: '30days', label: '近30天记录' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTempTimePreset(p.id as AfterSaleTimePreset)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                        tempTimePreset === p.id
                          ? 'border-[#00B578] bg-emerald-50 text-[#00B578] font-black shadow-2xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{p.label}</span>
                      {tempTimePreset === p.id && <Check className="w-3.5 h-3.5 text-[#00B578]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义时间区间筛选 */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800">
                    自定义时间区间
                  </label>
                  <button
                    type="button"
                    onClick={() => setTempTimePreset('custom')}
                    className={`text-[11px] font-bold ${
                      tempTimePreset === 'custom'
                        ? 'text-[#00B578] font-black'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tempTimePreset === 'custom' ? '已选择自定义区间' : '点击启用自定义'}
                  </button>
                </div>

                <div
                  onClick={() => setTempTimePreset('custom')}
                  className={`p-3 rounded-2xl border transition space-y-2 cursor-pointer ${
                    tempTimePreset === 'custom'
                      ? 'border-[#00B578] bg-emerald-50/40'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">开始日期</span>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => {
                          setTempStartDate(e.target.value);
                          setTempTimePreset('custom');
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#00B578] text-gray-800"
                      />
                    </div>
                    <span className="text-gray-400 font-bold mt-4">至</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">结束日期</span>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => {
                          setTempEndDate(e.target.value);
                          setTempTimePreset('custom');
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#00B578] text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempTimePreset('all');
                    setTempStartDate('2026-08-01');
                    setTempEndDate('2026-08-27');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  重置
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimePreset(tempTimePreset);
                    setCustomStartDate(tempStartDate);
                    setCustomEndDate(tempEndDate);
                    setShowTimeModal(false);
                    onShowToast(`已按时间筛选: ${tempTimePreset === 'custom' ? `${tempStartDate} ~ ${tempEndDate}` : tempTimePreset === 'today' ? '今日' : tempTimePreset === '7days' ? '近7天' : tempTimePreset === '30days' ? '近30天' : '全部时间'}`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                  id="btn-confirm-time-filter"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>确定筛选</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        售后订单详情弹窗 (详情页)
        将截图中的全部内容完整呈现在此详情弹窗中：
        1. 截图3：售后流转进度 (买家申请 -> 商家审核 -> 退款/换货完成)
        2. 截图1：顾客与履约条 (顾客姓名、电话、门店自提/同城配送)
        3. 截图2：申请原因与说明 (申请原因、申请时间、说明白色卡片、期望换货、退款金额明细)
        4. 售后商品明细
        5. 结算与超时损耗费明细
        6. 商家审核操作
      */}
      <AnimatePresence>
        {selectedDetailOrder && (() => {
          const detailOrder = orders.find((o) => o.orderNo === selectedDetailOrder.orderNo) || selectedDetailOrder;
          const afterSale = detailOrder.afterSale;
          const isPickup = detailOrder.fulfillType === 'pickup' || detailOrder.fulfillment?.fulfillType === 'pickup';
          const type = getNormalizedType(detailOrder);
          const currentStatus = afterSale?.status || (detailOrder.orderStatus === 'aftersale' ? 'pending' : detailOrder.orderStatus === 'refunded' ? 'completed' : 'pending');

          const typeBadge = {
            refund: { label: '仅退款', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: RotateCcw },
            exchange: { label: '到店换货', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: RefreshCw },
            return: { label: '退货退款', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: Undo2 },
          }[type];
          const TypeIcon = typeBadge.icon;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-4">
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 12 }}
                className="bg-white rounded-3xl p-4 md:p-5 max-w-md w-full shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col"
              >
                {/* 详情页顶栏 */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B578] flex items-center justify-center shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">售后服务单详情</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-gray-400">单号: {detailOrder.orderNo}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(detailOrder.orderNo);
                            onShowToast(`已复制单号 ${detailOrder.orderNo}`);
                          }}
                          className="text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          title="复制单号"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailOrder(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 详情页可滚动主体 */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
                  {/* 状态徽章条 */}
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-black border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeBadge.label}</span>
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                      currentStatus === 'pending'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : currentStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {currentStatus === 'pending'
                        ? '待商家审核'
                        : currentStatus === 'completed'
                        ? '已完成'
                        : currentStatus === 'rejected'
                        ? '已驳回'
                        : '处理中'}
                    </span>
                  </div>

                  {/* 截图 3：售后流转进度 (Lifecycle Timeline) */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      售后流转进度
                    </span>

                    {isPickup || type === 'refund' ? (
                      /* 自提退换货 / 仅退款：1. 买家申请 -> 2. 商家审核 -> 3. 退款完成 (或换货完成) */
                      <div className="flex items-center justify-between text-[10px] font-bold relative pt-1">
                        {/* Step 1: 买家申请 */}
                        <div className="flex flex-col items-center z-10">
                          <div className="w-6 h-6 rounded-full bg-[#00B578] text-white flex items-center justify-center shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-gray-700 mt-1">1.买家申请</span>
                          <span className="text-[9px] text-gray-400 font-mono scale-90 mt-0.5">
                            {(afterSale?.applyTime || detailOrder.createTime || '').slice(11, 16) || '已提交'}
                          </span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-1 -mt-6 transition-colors ${
                          currentStatus !== 'pending' ? 'bg-[#00B578]' : 'bg-gray-200'
                        }`} />

                        {/* Step 2: 商家审核 */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xs ${
                            currentStatus === 'rejected'
                              ? 'bg-rose-500 text-white'
                              : currentStatus === 'pending'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-[#00B578] text-white'
                          }`}>
                            {currentStatus === 'rejected' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : currentStatus === 'pending' ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className={`mt-1 ${
                            currentStatus === 'rejected'
                              ? 'text-rose-600'
                              : currentStatus === 'pending'
                              ? 'text-amber-600 font-black'
                              : 'text-gray-700'
                          }`}>
                            {currentStatus === 'rejected' ? '审核未通过' : '2.商家审核'}
                          </span>
                          <span className="text-[9px] text-gray-400 scale-90 mt-0.5">
                            {currentStatus === 'pending' ? '待处理' : '已审核'}
                          </span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-1 -mt-6 transition-colors ${
                          currentStatus === 'completed' ? 'bg-[#00B578]' : 'bg-gray-200'
                        }`} />

                        {/* Step 3: 退款完成 / 换货完成 */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xs ${
                            currentStatus === 'completed'
                              ? 'bg-[#00B578] text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {type === 'exchange' ? (
                              <RefreshCw className="w-3.5 h-3.5" />
                            ) : (
                              <DollarSign className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className={`mt-1 ${
                            currentStatus === 'completed'
                              ? 'text-[#00B578] font-black'
                              : 'text-gray-400'
                          }`}>
                            {type === 'exchange' ? '3.换货完成' : '3.退款完成'}
                          </span>
                          <span className="text-[9px] text-gray-400 scale-90 mt-0.5">
                            {currentStatus === 'completed' ? '已办结' : '待办结'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* 配送退货流程：1. 买家申请 -> 2. 商家审核 -> 3. 买家退回 -> 4. 退款完成 */
                      <div className="flex items-center justify-between text-[10px] font-bold relative pt-1">
                        <div className="flex flex-col items-center z-10">
                          <div className="w-6 h-6 rounded-full bg-[#00B578] text-white flex items-center justify-center shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-gray-700 mt-1">1.买家申请</span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-colors ${
                          currentStatus !== 'pending' ? 'bg-[#00B578]' : 'bg-gray-200'
                        }`} />

                        <div className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xs ${
                            currentStatus === 'rejected'
                              ? 'bg-rose-500 text-white'
                              : currentStatus === 'pending'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-[#00B578] text-white'
                          }`}>
                            {currentStatus === 'rejected' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : currentStatus === 'pending' ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className={`mt-1 ${currentStatus === 'pending' ? 'text-amber-600 font-black' : 'text-gray-700'}`}>
                            2.商家审核
                          </span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-colors ${
                          currentStatus === 'customer_shipped' || currentStatus === 'completed'
                            ? 'bg-[#00B578]'
                            : 'bg-gray-200'
                        }`} />

                        <div className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xs ${
                            currentStatus === 'customer_shipped' || currentStatus === 'completed'
                              ? 'bg-[#00B578] text-white'
                              : currentStatus === 'approved' || currentStatus === 'waiting_customer_ship'
                              ? 'bg-blue-500 text-white animate-pulse'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="mt-1 text-gray-700">3.买家退回</span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-colors ${
                          currentStatus === 'completed' ? 'bg-[#00B578]' : 'bg-gray-200'
                        }`} />

                        <div className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-2xs ${
                            currentStatus === 'completed' ? 'bg-[#00B578] text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className={`mt-1 ${currentStatus === 'completed' ? 'text-[#00B578] font-black' : 'text-gray-400'}`}>
                            4.退款完成
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 截图 1：顾客信息与履约方式条 (Consumer Info Bar) */}
                  <div className="flex items-center justify-between text-xs bg-gray-50/90 px-3 py-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-800 font-bold">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{detailOrder.fulfillment?.receiverName || '顾客'}</span>
                      <span className="text-gray-400 font-mono text-[11px]">
                        ({detailOrder.fulfillment?.receiverPhone || '138****5621'})
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#00B578] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center space-x-1">
                      {isPickup ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      <span>{isPickup ? '门店自提订单' : '同城即时配送'}</span>
                    </span>
                  </div>

                  {/* 截图 2：申请原因与说明 (After-sales Reason & Info Box) */}
                  <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3 space-y-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-950 flex items-center space-x-1.5 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>申请原因: {detailOrder.aftersaleReason || afterSale?.reason || '商品品质问题'}</span>
                      </div>
                      <div className="text-[10px] text-amber-800/80 font-mono pl-5">
                        申请时间: {afterSale?.applyTime || detailOrder.createTime || '2026-08-27 15:30'}
                      </div>
                    </div>

                    {/* 说明：白色卡片内带浅边框 */}
                    <div className="text-xs text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs leading-relaxed">
                      <span className="font-bold text-amber-950 block mb-0.5">说明：</span>
                      {afterSale?.description || '因规格或偏好需要售后，已提交申请并按规则办理退款或换货。'}
                    </div>

                    {/* 期望换货信息 */}
                    {type === 'exchange' && afterSale?.exchangeSpec && (
                      <div className="text-xs text-blue-900 bg-blue-50/90 p-2 rounded-xl border border-blue-200/60 font-medium flex items-center justify-between">
                        <span>期望换货: <strong className="font-bold text-blue-950">{afterSale.exchangeSpec}</strong></span>
                        <span className="text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded font-bold">
                          {isPickup ? '到店直接调换' : '骑手上门换新'}
                        </span>
                      </div>
                    )}

                    {/* 买家退货物流 */}
                    {afterSale?.returnTrackingNo && (
                      <div className="text-xs text-purple-900 bg-purple-50/90 p-2 rounded-xl border border-purple-200/60 flex items-center justify-between">
                        <span>退货物流: <strong className="font-mono font-bold text-purple-950">{afterSale.returnTrackingNo}</strong></span>
                        <span className="text-[10px] text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded font-bold">买家已退回</span>
                      </div>
                    )}

                    {/* 退款金额展示与超时损耗费计算 */}
                    {type !== 'exchange' && (
                      <div className="pt-1 border-t border-amber-200/50 space-y-1">
                        {detailOrder.isOverduePickup || (afterSale?.overdueServiceFee && afterSale.overdueServiceFee > 0) ? (
                          <div className="bg-white/90 rounded-xl p-2.5 border border-amber-200/70 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>订单原实付金额:</span>
                              <span>¥{detailOrder.payAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-rose-600 font-bold">
                              <span>超时未自提服务费 ({detailOrder.overdueFeeRate || afterSale?.overdueFeeRate || 10}%):</span>
                              <span>-¥{(detailOrder.overdueServiceFee || afterSale?.overdueServiceFee || (detailOrder.payAmount * 0.1)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-200 text-xs font-black">
                              <span className="text-gray-800">退还买家金额:</span>
                              <span className="text-rose-600 font-sans text-sm">
                                ¥{(afterSale?.refundAmount ?? Math.max(0, detailOrder.payAmount - (detailOrder.overdueServiceFee || (detailOrder.payAmount * 0.1)))).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-between font-medium">
                              <span>商户获补超时服务费:</span>
                              <span className="font-bold">+¥{(detailOrder.overdueServiceFee || afterSale?.overdueServiceFee || (detailOrder.payAmount * 0.1)).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-white/70 px-2.5 py-1.5 rounded-xl border border-amber-200/50">
                            <span className="text-xs text-gray-600">申请退款金额:</span>
                            <span className="text-base font-black text-rose-600 font-sans">
                              ¥{(afterSale?.refundAmount || detailOrder.payAmount).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 售后商品清单 */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      关联商品明细
                    </span>
                    <div className="space-y-2">
                      {detailOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-50/60 rounded-xl border border-gray-100">
                          <img
                            src={item.imageSnapshot}
                            alt={item.titleSnapshot}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-gray-900 truncate">
                              {item.titleSnapshot}
                            </h4>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                              规格: {item.specSnapshot || '标准份'}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-black text-gray-900 font-sans">
                                ¥{(item.priceSnapshot || 0).toFixed(2)}
                              </span>
                              <span className="text-[11px] text-gray-400 font-sans">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 审核驳回记录 (若已驳回) */}
                  {currentStatus === 'rejected' && (
                    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs space-y-1">
                      <div className="font-bold text-rose-800 flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>申请已被商家驳回</span>
                      </div>
                      <p className="text-rose-700 leading-relaxed pl-5">
                        驳回原因: {afterSale?.auditReason || '商品不满足售后条件'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 详情页底部操作栏 */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition cursor-pointer"
                  >
                    返回列表
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Status 1: 待商家审核 */}
                    {currentStatus === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalOrder(detailOrder);
                            setCustomRejectReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                        >
                          拒绝申请
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleApprove(detailOrder);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isPickup
                              ? type === 'exchange'
                                ? '同意换货'
                                : '同意退款'
                              : '审核通过'}
                          </span>
                        </button>
                      </>
                    )}

                    {/* Status 2: 等待退回或已寄出 */}
                    {(currentStatus === 'approved' || currentStatus === 'waiting_customer_ship' || currentStatus === 'customer_shipped') && (
                      <button
                        type="button"
                        onClick={() => {
                          handleConfirmReceived(detailOrder);
                        }}
                        className="px-4 py-2 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl text-xs font-black cursor-pointer transition shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{type === 'exchange' ? '确认收货并换货' : '确认收货并打款'}</span>
                      </button>
                    )}

                    {/* 已完成提示 */}
                    {currentStatus === 'completed' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00B578]" />
                        <span>{type === 'exchange' ? '换货已完成' : '款项已原路退回'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 font-black text-sm text-gray-900">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>拒绝售后申请</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <p className="text-gray-500">
                  请选择或填写驳回订单 <span className="font-bold text-gray-800">{rejectModalOrder.orderNo}</span> 售后申请的原因：
                </p>

                {/* Quick Reject Reasons */}
                <div className="space-y-1.5">
                  {REJECT_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRejectReason(r)}
                      className={`w-full text-left p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                        rejectReason === r
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    补充说明 (选填)
                  </label>
                  <textarea
                    rows={2}
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    placeholder="请输入详细拒绝原因反馈给买家..."
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalReason = customRejectReason.trim() || rejectReason;
                    onRejectAfterSale(rejectModalOrder.orderNo, finalReason);
                    setRejectModalOrder(null);
                    onShowToast(`已驳回订单 ${rejectModalOrder.orderNo} 售后申请`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  确认驳回
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
