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
  Copy,
  Printer,
  ShoppingBag,
  Plus,
  Minus,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, AfterSaleInfo } from '../../types';
import { speakText, playChime } from '../../utils/audio';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { MerchantOrderItem, formatPickupTimePoint } from './MerchantOrdersView';

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

export interface StoreExchangeProduct {
  id: string;
  title: string;
  image: string;
  specs: { name: string; price: number }[];
}

export const STORE_EXCHANGE_PRODUCTS: StoreExchangeProduct[] = [
  {
    id: 'prod_1',
    title: '老街坊秘制红烧牛肉面',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '标准碗 (含大块牛肉50g)', price: 18.0 },
      { name: '豪华加肉加蛋碗 (含双倍牛肉+卤蛋)', price: 26.0 },
      { name: '特制大牛筋丸双拼大碗', price: 30.0 },
    ],
  },
  {
    id: 'prod_2',
    title: '秘制卤香牛腱切盘',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '150g配秘制香辣蘸料', price: 32.0 },
      { name: '250g大盘特享装配双蘸料', price: 48.0 },
    ],
  },
  {
    id: 'prod_3',
    title: '招牌麻辣牛杂面',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '微辣标准碗', price: 24.0 },
      { name: '重辣大份 (加倍牛杂)', price: 28.0 },
    ],
  },
  {
    id: 'prod_4',
    title: '特制酸汤肥牛面',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '酸香微辣标准份', price: 26.0 },
      { name: '特浓金汤大碗 (含双倍肥牛)', price: 32.0 },
    ],
  },
  {
    id: 'prod_5',
    title: '老北京手工酸梅汤 (500ml冰镇)',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '500ml微甜少冰 (手工慢熬)', price: 6.0 },
      { name: '1000ml分享大瓶装', price: 10.0 },
    ],
  },
  {
    id: 'prod_6',
    title: '手作香脆炸油条 (2根)',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '现炸酥脆2根装', price: 6.0 },
    ],
  },
  {
    id: 'prod_7',
    title: '秘制五香卤蛋 (1个)',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80',
    specs: [
      { name: '入味醇香单枚装', price: 3.0 },
      { name: '超值双枚装', price: 5.0 },
    ],
  },
];

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

  // Status Filter: 'all' | 'in_progress' | 'refunded' | 'pending' | 'waiting_refund' | 'rejected' | 'completed'
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
  const [rejectReason, setRejectReason] = useState<string>('商品已拆封使用，影响二次销售');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  // Exchange Modification Modal State (同意换货弹窗：选择商品逻辑与价格联动)
  const [exchangeModalOrder, setExchangeModalOrder] = useState<Order | null>(null);
  const [selectedExchangeProductId, setSelectedExchangeProductId] = useState<string>('prod_1');
  const [exchangeTitle, setExchangeTitle] = useState<string>('');
  const [exchangeSpec, setExchangeSpec] = useState<string>('');
  const [exchangeQuantity, setExchangeQuantity] = useState<number>(1);
  const [exchangePrice, setExchangePrice] = useState<number>(0);
  const [merchantNote, setMerchantNote] = useState<string>('');

  // After-sale Merged Detail Modal State
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [copiedOrderNo, setCopiedOrderNo] = useState<boolean>(false);

  // Receipt Modal State
  const [receiptPrintOrder, setReceiptPrintOrder] = useState<MerchantOrderItem | null>(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // Handler: Open Exchange Modal (使用选择逻辑自动匹配商品与带出价格)
  const handleOpenExchangeModal = (order: Order) => {
    const firstItem = order.items[0];
    setExchangeModalOrder(order);

    const existingTitle = order.afterSale?.exchangeProductTitle || firstItem?.titleSnapshot;
    const matchedProd = STORE_EXCHANGE_PRODUCTS.find((p) => p.title === existingTitle) || STORE_EXCHANGE_PRODUCTS[0];
    setSelectedExchangeProductId(matchedProd.id);
    setExchangeTitle(matchedProd.title);

    const existingSpec = order.afterSale?.exchangeSpec || order.afterSale?.exchangeOptions?.exchangeSpec || firstItem?.specSnapshot;
    const matchedSpec = matchedProd.specs.find((s) => s.name === existingSpec) || matchedProd.specs[0];
    setExchangeSpec(matchedSpec.name);
    // 价格跟着商品规格自动带出；若之前商家已有自定义价格则优先保持，否则使用规格原价
    setExchangePrice(order.afterSale?.exchangePrice !== undefined ? order.afterSale.exchangePrice : matchedSpec.price);
    setExchangeQuantity(order.afterSale?.exchangeQuantity || firstItem?.quantity || 1);
    setMerchantNote(order.afterSale?.merchantNote || '已与顾客现场沟通确认调换规格，并完成差价核算。');
  };

  // 选择调换商品：自动带出默认规格及对应价格
  const handleSelectExchangeProduct = (prodId: string) => {
    const prod = STORE_EXCHANGE_PRODUCTS.find((p) => p.id === prodId);
    if (!prod) return;
    setSelectedExchangeProductId(prod.id);
    setExchangeTitle(prod.title);
    const firstSpec = prod.specs[0];
    setExchangeSpec(firstSpec.name);
    // 价格跟着商品带出
    setExchangePrice(firstSpec.price);
  };

  // 选择规格：价格跟着商品规格带出，后续商家仍可手动修改
  const handleSelectExchangeSpec = (specName: string, specPrice: number) => {
    setExchangeSpec(specName);
    setExchangePrice(specPrice);
  };

  // Handler: Confirm Exchange Submit
  const handleConfirmExchangeSubmit = () => {
    if (!exchangeModalOrder) return;
    const isPickup = exchangeModalOrder.fulfillType === 'pickup' || exchangeModalOrder.fulfillment?.fulfillType === 'pickup';

    // Update after-sales details in the order
    exchangeModalOrder.afterSale = {
      ...(exchangeModalOrder.afterSale || {
        type: 'exchange',
        reason: '商品规格调换',
        status: isPickup ? 'completed' : 'approved',
      }),
      type: 'exchange',
      status: isPickup ? 'completed' : 'approved',
      exchangeProductTitle: exchangeTitle,
      exchangeSpec,
      exchangeQuantity,
      exchangePrice,
      merchantNote,
      auditTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      finishTime: isPickup ? new Date().toLocaleTimeString('zh-CN', { hour12: false }) : undefined,
      auditReason: `商家已同意换货并确认调换规格：${exchangeTitle} (${exchangeSpec})`,
    };
    if (isPickup) {
      exchangeModalOrder.orderStatus = 'aftersale';
    }

    onApproveAfterSale(exchangeModalOrder.orderNo);
    playChime();
    speakText('换货审核通过，调换商品信息已生效！');
    onShowToast(`已同意订单 ${exchangeModalOrder.orderNo} 换货申请，商品信息已修改保存！`);
    // 换货确认后直接调起小票打印预览
    handlePrintExchangeReceipt(exchangeModalOrder);
    setExchangeModalOrder(null);
  };

  // Handler: Merchant Approve (Refund or Delivery Return)
  const handleApprove = (order: Order) => {
    const isPickup = order.fulfillType === 'pickup' || order.fulfillment?.fulfillType === 'pickup';
    const type = getNormalizedType(order);
    onApproveAfterSale(order.orderNo);
    playChime();
    if (isPickup) {
      speakText('自提到店售后审核通过，已直接完成退款！');
      onShowToast(`已同意订单 ${order.orderNo} 售后申请，自提已退款！`);
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

  // Copy Order Number Helper
  const handleCopyOrderNo = (no: string) => {
    navigator.clipboard.writeText(no);
    setCopiedOrderNo(true);
    setTimeout(() => setCopiedOrderNo(false), 2000);
    onShowToast(`单号 ${no} 已复制到剪贴板`);
  };

  // Convert Order to MerchantOrderItem for thermal receipt
  const convertOrderToMerchantOrderItem = (order: Order): MerchantOrderItem => {
    return {
      id: order.orderNo,
      orderNo: order.orderNo,
      customerName: order.fulfillment?.receiverName || '顾客',
      customerPhone: order.fulfillment?.receiverPhone || '138****5621',
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      consumeTimesTag: '在本店消费2次',
      statusText: order.orderStatus === 'refunded' ? '已退款' : '售后中',
      time: order.createTime,
      pickupTime: order.selectedPickupTime || order.createTime,
      payTime: order.payTime || order.createTime,
      orderAmount: order.goodsAmount,
      payAmount: order.payAmount,
      rebateDiscount: order.rebateDiscount || 0,
      deductedAmount: order.pointDeductAmount || 0,
      fulfillType: 'pickup',
      channel: order.channel || 'online',
      pickupCode: order.fulfillment?.pickupCode,
      isRefunded: order.orderStatus === 'refunded',
      items: order.items.map((i) => ({
        title: i.titleSnapshot,
        spec: i.specSnapshot,
        price: i.priceSnapshot,
        quantity: i.quantity,
        image: i.imageSnapshot,
      })),
    };
  };

  // 换货打印小票：打印的小票上面需新商品，换货时间
  const handlePrintExchangeReceipt = (order: Order) => {
    const afterSale = order.afterSale;
    const firstItem = order.items[0];
    const newTitle = afterSale?.exchangeProductTitle || '老街坊秘制红烧牛肉面';
    const newSpec = afterSale?.exchangeSpec || afterSale?.exchangeOptions?.exchangeSpec || '豪华加肉加蛋碗 (含双倍牛肉+卤蛋)';
    const newPrice = afterSale?.exchangePrice !== undefined ? afterSale.exchangePrice : 26.0;
    const newQuantity = afterSale?.exchangeQuantity || 1;

    // 获取完整换货时间 (年-月-日 时:分:秒)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const nowTimeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const exchangeTime = afterSale?.finishTime || afterSale?.auditTime || nowTimeStr;

    const oldTotal = (firstItem?.priceSnapshot || 0) * (firstItem?.quantity || 1);
    const newTotal = newPrice * newQuantity;
    const rawDiff = parseFloat((newTotal - oldTotal).toFixed(2));
    // 商家不做退差价，只有消费者少补，没有多退
    const diff = rawDiff > 0 ? rawDiff : 0;

    const printItem: MerchantOrderItem = {
      ...convertOrderToMerchantOrderItem(order),
      isExchangeReceipt: true,
      exchangeInfo: {
        exchangeTime,
        newProductTitle: newTitle,
        newSpec,
        newQuantity,
        newPrice,
        oldProductTitle: `${firstItem?.titleSnapshot || '原购买商品'} (${firstItem?.specSnapshot || '原规格'})`,
        diffAmount: diff,
        merchantNote: afterSale?.merchantNote || '已现场确认换新商品',
      },
    };

    setReceiptPrintOrder(printItem);
  };

  // Quick Reject Reasons
  const REJECT_REASONS = [
    '商品已拆封使用，影响二次销售',
    '已超过售后处理时限(生鲜超24小时)',
    '未提供商品变质/破损有效凭证',
    '买家个人原因拍错/不想要',
    '已与买家协商一致线下调换',
  ];

  // Quick Exchange Spec Suggestions
  const EXCHANGE_SPEC_PRESETS = [
    '豪华大份 (双倍肉量)',
    '加卤蛋+豆干',
    '微辣大碗 (免香菜)',
    '特大豪华版 (配饮品)',
    '换冷冻高汤底料包',
  ];

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden relative">
      {/* 1. Top Status Selector Tabs & Multi-Dimensional Filters */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2.5 shrink-0 space-y-2.5 shadow-2xs">
        {/* Row 1: 文本风格主状态导航选项卡 */}
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
              count: afterSaleOrders.filter(
                (o) => o.orderStatus === 'refunded' || o.afterSale?.status === 'completed'
              ).length,
            },
            {
              id: 'pending',
              label: '待审核',
              count: afterSaleOrders.filter((o) => o.afterSale?.status === 'pending').length,
            },
            {
              id: 'rejected',
              label: '已驳回',
              count: afterSaleOrders.filter((o) => o.afterSale?.status === 'rejected').length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as AfterSaleStatusFilter)}
                className={`relative pb-2 px-1 text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  isActive ? 'text-[#00B578]' : 'text-gray-500 hover:text-gray-800'
                }`}
                id={`btn-aftersale-tab-${tab.id}`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                      isActive ? 'bg-emerald-100 text-[#00B578]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="aftersalesActiveIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B578] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: 售后分类胶囊按钮 + 时间筛选 + 搜索框 */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* 胶囊分类 */}
          <div className="flex items-center space-x-1.5 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: '全部类型' },
              { id: 'refund', label: '退款' },
              { id: 'exchange', label: '换货' },
              { id: 'return', label: '退货' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as AfterSaleCategory)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#00B578] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                id={`btn-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 时间预设筛选胶囊按钮 */}
          <button
            type="button"
            onClick={() => {
              setTempTimePreset(timePreset);
              setTempStartDate(customStartDate);
              setTempEndDate(customEndDate);
              setShowTimeModal(true);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center space-x-1 border shrink-0 ${
              timePreset !== 'all'
                ? 'bg-emerald-50 border-emerald-300 text-[#00B578]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            id="btn-time-filter"
          >
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="truncate max-w-[80px]">{getTimeFilterLabel()}</span>
            <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
          </button>
        </div>

        {/* 关键字搜索栏 */}
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索买家姓名 / 手机号 / 订单号 / 商品名称 / 售后原因"
            className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 transition"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Order Card List Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-gray-100 mt-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-500">暂无符合条件的售后服务单</p>
            <p className="text-[11px] text-gray-400">
              {keyword ? '可尝试清除搜索关键字或调整筛选条件' : '商户产生的退款、退货或换货诉求将在此展示'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPickup = order.fulfillType === 'pickup' || order.fulfillment?.fulfillType === 'pickup';
            const type = getNormalizedType(order);
            const afterSale = order.afterSale;
            const currentStatus =
              afterSale?.status || (order.orderStatus === 'refunded' ? 'completed' : 'pending');

            const typeBadge = {
              refund: {
                label: '仅退款',
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                border: 'border-rose-200',
                icon: RotateCcw,
              },
              exchange: {
                label: '到店换货',
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                border: 'border-blue-200',
                icon: RefreshCw,
              },
              return: {
                label: '退货退款',
                bg: 'bg-purple-50',
                text: 'text-purple-600',
                border: 'border-purple-200',
                icon: Undo2,
              },
            }[type];
            const TypeIcon = typeBadge.icon;

            return (
              <div
                key={order.orderNo}
                onClick={() => setSelectedDetailOrder(order)}
                className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-2.5 hover:border-emerald-200 transition cursor-pointer"
                id={`card-aftersale-${order.orderNo}`}
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-50">
                  <div className="flex items-center space-x-1.5 font-mono text-gray-500">
                    <span className="font-bold text-gray-900">{order.orderNo}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {/* 售后分类标签 */}
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-black border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}
                    >
                      <TypeIcon className="w-2.5 h-2.5" />
                      <span>{typeBadge.label}</span>
                    </span>
                    {/* 状态文字 */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
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

                {/* Goods Snapshot List */}
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
                        <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                          规格: {item.specSnapshot || '标准份'}
                        </div>
                        {/* 到店自提的标签放在价格上面 (User Requirement 5) */}
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[9px] font-black border ${
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
                  <div>
                    {/* 售后换货支持打印小票 (打印的小票上面需新商品，换货时间) */}
                    {type === 'exchange' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintExchangeReceipt(order);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                        id={`btn-print-exchange-${order.orderNo}`}
                        title="打印换货小票"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>打印小票</span>
                      </button>
                    )}
                  </div>
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
                          驳回
                        </button>

                        {/* 同意换货 (唤起弹窗修改换货商品信息) vs 同意退款 */}
                        {type === 'exchange' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenExchangeModal(order);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1"
                            id={`btn-approve-exchange-${order.orderNo}`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>同意换货</span>
                          </button>
                        ) : (
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
                              {isPickup ? '同意退款' : '审核通过'}
                            </span>
                          </button>
                        )}
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

                    {/* Status 5: 已驳回 */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                  <Calendar className="w-4 h-4 text-[#00B578]" />
                  <span>选择售后时间范围</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 预设快捷选项 */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: '全部时间' },
                  { id: 'today', label: '今日' },
                  { id: '7days', label: '近7天' },
                  { id: '30days', label: '近30天' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTempTimePreset(item.id as AfterSaleTimePreset)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      tempTimePreset === item.id
                        ? 'bg-emerald-50 border-[#00B578] text-[#00B578] shadow-2xs'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* 自定义时间选项 */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setTempTimePreset('custom')}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                    tempTimePreset === 'custom'
                      ? 'bg-emerald-50 border-[#00B578] text-[#00B578]'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  自定义时间区间
                </button>

                {tempTimePreset === 'custom' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500 w-10 shrink-0">开始:</span>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#00B578]"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500 w-10 shrink-0">结束:</span>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#00B578]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 弹窗底部操作 */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setTempTimePreset('all');
                    setTimePreset('all');
                    setShowTimeModal(false);
                  }}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  重置全部
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimePreset(tempTimePreset);
                    setCustomStartDate(tempStartDate);
                    setCustomEndDate(tempEndDate);
                    setShowTimeModal(false);
                    onShowToast(`已应用时间筛选: ${tempTimePreset === 'custom' ? `${tempStartDate} ~ ${tempEndDate}` : tempTimePreset}`);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        3. 同意换货弹窗：修改换货商品信息，包括原商品信息对比与差价计算 (User Requirement 3)
      */}
      <AnimatePresence>
        {exchangeModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-4 md:p-5 max-w-sm w-full shadow-2xl space-y-3.5 my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">同意换货并确认商品信息</h3>
                    <p className="text-[10px] text-gray-400 font-mono">订单: {exchangeModalOrder.orderNo}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExchangeModalOrder(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5 text-xs">
                {/* 1. 原商品信息 (只读展示，对比参考) */}
                <div className="bg-gray-50/90 rounded-2xl p-3 border border-gray-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                      <ShoppingBag className="w-3 h-3 text-gray-400" />
                      <span>原订单购买商品信息</span>
                    </span>
                    <span className="text-[10px] text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded font-bold">
                      原订单
                    </span>
                  </div>

                  {exchangeModalOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-100">
                      <img
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{item.titleSnapshot}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                          原规格: {item.specSnapshot || '标准份'}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-gray-400 font-sans">
                            单价: ¥{item.priceSnapshot.toFixed(2)} × {item.quantity}
                          </span>
                          <span className="font-black text-gray-900 font-sans">
                            ¥{(item.priceSnapshot * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-1 border-t border-gray-200/60 text-[11px] text-gray-500">
                    <span>原订单实付金额:</span>
                    <span className="font-mono font-black text-gray-800">
                      ¥{exchangeModalOrder.payAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 2. 换货商品信息 (选择逻辑，价格跟着商品带出，可自由修改) */}
                <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      <span>调换商品选择 (价格自动带出·可自由修改)</span>
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded font-bold">
                      从店内商品库选择
                    </span>
                  </div>

                  {/* 换货商品选择：下拉框与快速品类按钮 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                      <span>调换商品名称 <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-gray-400 font-normal">选择商品自动带出价格</span>
                    </label>

                    {/* 下拉选择 */}
                    <div className="relative">
                      <select
                        value={selectedExchangeProductId}
                        onChange={(e) => handleSelectExchangeProduct(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 appearance-none outline-none focus:border-blue-500 pr-8 cursor-pointer shadow-2xs"
                      >
                        {STORE_EXCHANGE_PRODUCTS.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.title} (起步价 ¥{prod.specs[0]?.price.toFixed(2)})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 调换规格：选择逻辑，点击规格自动带出对应价格 */}
                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                      <span>调换规格选择 <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-blue-600 font-medium">点击规格联动更新价格</span>
                    </label>

                    {(() => {
                      const currentProd = STORE_EXCHANGE_PRODUCTS.find((p) => p.id === selectedExchangeProductId) || STORE_EXCHANGE_PRODUCTS[0];
                      return (
                        <div className="flex flex-wrap gap-1.5">
                          {currentProd.specs.map((s) => {
                            const isSpecActive = exchangeSpec === s.name;
                            return (
                              <button
                                key={s.name}
                                type="button"
                                onClick={() => handleSelectExchangeSpec(s.name, s.price)}
                                className={`px-2.5 py-1 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                                  isSpecActive
                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                    : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 font-medium'
                                }`}
                              >
                                <span>{s.name}</span>
                                <span className={`font-mono text-[10px] ${isSpecActive ? 'text-blue-100 font-bold' : 'text-emerald-600 font-bold'}`}>
                                  ¥{s.price.toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 数量与单价输入 (价格跟着商品带出，支持商家手动修改) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700">调换数量</label>
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 justify-between shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setExchangeQuantity((q) => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-black text-xs text-gray-900">{exchangeQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setExchangeQuantity((q) => q + 1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-700">换货单价 (元)</label>
                        <span className="text-[9px] text-blue-600 font-medium">带出后可修改</span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={exchangePrice}
                        onChange={(e) => setExchangePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400 font-mono font-black text-gray-900 text-right shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 差价自动核算与提示 */}
                  {(() => {
                    const firstItem = exchangeModalOrder.items[0];
                    const originalTotal = (firstItem?.priceSnapshot || 0) * (firstItem?.quantity || 1);
                    const newTotal = exchangePrice * exchangeQuantity;
                    const diff = newTotal - originalTotal;

                    return (
                      <div className="bg-white rounded-xl p-2.5 border border-blue-200/80 space-y-1 text-xs">
                        <div className="flex justify-between text-[11px] text-gray-500">
                          <span>原商品总额:</span>
                          <span className="font-mono">¥{originalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-blue-900 font-bold">
                          <span>调换后商品总额:</span>
                          <span className="font-mono">¥{newTotal.toFixed(2)}</span>
                        </div>
                        <div className="pt-1 border-t border-dashed border-gray-200 flex items-center justify-between">
                          <span className="font-bold text-gray-800">差价核算:</span>
                          {diff > 0 ? (
                            <span className="text-amber-600 font-black font-sans text-xs">
                              需补差价: +¥{diff.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-black font-sans text-xs">
                              无需补退 (不退差价)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {diff > 0
                            ? '提示: 调换商品总额高于原商品，顾客需当面补交差额。'
                            : '提示: 换货规则：商家不做退差价，只有消费者少补，没有多退。'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* 商家备注 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">调换说明 / 商家备注</label>
                    <textarea
                      rows={2}
                      value={merchantNote}
                      onChange={(e) => setMerchantNote(e.target.value)}
                      placeholder="填写换货核验说明，如现场已调换并收取补差..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setExchangeModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExchangeSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                  id="btn-confirm-exchange-modal"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>确认同意换货</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        4. 售后详情页：把订单页面的内容完整加到一起 (User Requirement 6)
      */}
      <AnimatePresence>
        {selectedDetailOrder && (() => {
          const detailOrder = selectedDetailOrder;
          const isPickup = detailOrder.fulfillType === 'pickup' || detailOrder.fulfillment?.fulfillType === 'pickup';
          const type = getNormalizedType(detailOrder);
          const afterSale = detailOrder.afterSale;
          const currentStatus =
            afterSale?.status || (detailOrder.orderStatus === 'refunded' ? 'completed' : 'pending');

          const typeBadge = {
            refund: { label: '仅退款', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: RotateCcw },
            exchange: { label: '到店换货', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: RefreshCw },
            return: { label: '退货退款', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: Undo2 },
          }[type];
          const TypeIcon = typeBadge.icon;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-4 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 12 }}
                className="bg-white rounded-3xl p-4 md:p-5 max-w-md w-full shadow-2xl space-y-3.5 max-h-[92vh] flex flex-col my-auto"
              >
                {/* 详情页顶栏 */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B578] flex items-center justify-center shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">售后与订单详情</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-gray-400">单号: {detailOrder.orderNo}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNo(detailOrder.orderNo)}
                          className="text-gray-400 hover:text-gray-700 transition cursor-pointer flex items-center"
                          title="复制单号"
                        >
                          {copiedOrderNo ? (
                            <Check className="w-3 h-3 text-[#00B578]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
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

                {/* 详情页可滚动主体 (合并售后 + 完整订单信息) */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5 text-xs">
                  {/* 状态与履约横幅 */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-gray-500">当前订单与售后状态</div>
                      <div className="text-sm font-black text-emerald-950 mt-0.5 flex items-center space-x-1.5">
                        <span>
                          {currentStatus === 'pending'
                            ? '待商家审核'
                            : currentStatus === 'completed'
                            ? type === 'exchange' ? '换货已完成' : '退款已完成'
                            : currentStatus === 'rejected'
                            ? '已驳回'
                            : '处理中'}
                        </span>
                        <span className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[10px] font-black border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}>
                          <TypeIcon className="w-2.5 h-2.5" />
                          <span>{typeBadge.label}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-1 flex items-center space-x-1 font-medium">
                        <ShoppingBag className="w-3 h-3" />
                        <span>
                          履约方式: {detailOrder.channel === 'offline' ? '线下就餐消费' : isPickup ? '到店自提 (线上预定)' : '同城即时配送'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                      currentStatus === 'pending'
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : currentStatus === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                    }`}>
                      {currentStatus === 'pending'
                        ? '待处理'
                        : currentStatus === 'completed'
                        ? '已办结'
                        : currentStatus === 'rejected'
                        ? '未通过'
                        : '流转中'}
                    </span>
                  </div>

                  {/* 售后流转进度 (Lifecycle Timeline) */}
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

                  {/* 退款成功专区：增加显著的退款金额卡片 */}
                  {currentStatus === 'completed' && type !== 'exchange' && (
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#00B578]" />
                          <span className="text-xs font-black text-emerald-950">退款成功 (原路退还)</span>
                        </div>
                        <span className="text-[10px] bg-[#00B578] text-white font-bold px-2 py-0.5 rounded-full">
                          已打款
                        </span>
                      </div>

                      {/* 核心展示：退款金额 */}
                      <div className="bg-white/95 rounded-xl p-3 border border-emerald-200/70 flex items-baseline justify-between shadow-2xs">
                        <div>
                          <span className="text-xs text-gray-500 font-bold block">退款到账总额</span>
                          <span className="text-[10px] text-gray-400">已退还原支付账户 (微信/通宝)</span>
                        </div>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-sm font-black text-rose-600">¥</span>
                          <span className="text-2xl font-black text-rose-600 font-sans tracking-tight">
                            {(afterSale?.refundAmount ?? (detailOrder.isOverduePickup ? Math.max(0, detailOrder.payAmount - (detailOrder.overdueServiceFee || (detailOrder.payAmount * 0.1))) : detailOrder.payAmount)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                        <div className="bg-white/80 rounded-lg p-2 border border-emerald-100/60">
                          <span className="text-gray-400 block text-[10px]">原订单实付</span>
                          <span className="font-bold text-gray-800 font-mono">¥{detailOrder.payAmount.toFixed(2)}</span>
                        </div>
                        <div className="bg-white/80 rounded-lg p-2 border border-emerald-100/60">
                          <span className="text-gray-400 block text-[10px]">退款到账方式</span>
                          <span className="font-bold text-emerald-700">原路返还 (即时到账)</span>
                        </div>
                      </div>

                      {detailOrder.isOverduePickup && (detailOrder.overdueServiceFee || (detailOrder.payAmount * 0.1)) > 0 && (
                        <div className="text-[10px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200/60 flex items-center justify-between font-medium">
                          <span>扣除超时未自提服务费 ({detailOrder.overdueFeeRate || 10}%):</span>
                          <span className="font-bold">-¥{(detailOrder.overdueServiceFee || (detailOrder.payAmount * 0.1)).toFixed(2)}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between pt-1 border-t border-emerald-200/50">
                        <span>退款流水号: REF{detailOrder.orderNo.replace(/\D/g, '') || '20260827001'}</span>
                        <span>完成时间: {afterSale?.finishTime || '2026-08-27 16:15:30'}</span>
                      </div>
                    </div>
                  )}

                  {/* 售后诉求与凭证卡片 */}
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

                    {/* 补充说明 */}
                    <div className="text-xs text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs leading-relaxed">
                      <span className="font-bold text-amber-950 block mb-0.5">补充说明：</span>
                      {afterSale?.description || '因规格或偏好需要售后，已提交申请并按规则办理退款或换货。'}
                    </div>

                    {/* 顾客上传的凭证图片 (若有，支持点击放大预览) */}
                    {afterSale?.images && afterSale.images.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-amber-950 flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-amber-600" />
                          <span>买家上传凭证 ({afterSale.images.length}张):</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {afterSale.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => setPreviewImage(imgUrl)}
                              className="w-16 h-16 rounded-xl border border-amber-200 overflow-hidden cursor-pointer hover:opacity-90 relative group"
                            >
                              <img
                                src={imgUrl}
                                alt={`凭证${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                查看
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 期望换货信息 */}
                    {type === 'exchange' && (
                      <div className="text-xs text-blue-900 bg-blue-50/90 p-2.5 rounded-xl border border-blue-200/60 font-medium space-y-1">
                        <div className="flex items-center justify-between">
                          <span>
                            期望换货: <strong className="font-bold text-blue-950">{afterSale?.exchangeSpec || '豪华大份 (双倍肉量)'}</strong>
                          </span>
                          <span className="text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded font-bold">
                            {isPickup ? '到店直接调换' : '骑手上门换新'}
                          </span>
                        </div>
                        {afterSale?.exchangeProductTitle && (
                          <div className="text-[11px] text-blue-800">
                            调换商品: <span className="font-bold">{afterSale.exchangeProductTitle}</span>
                            {afterSale.exchangeQuantity && ` × ${afterSale.exchangeQuantity}`}
                            {afterSale.exchangePrice !== undefined && ` (单价: ¥${afterSale.exchangePrice.toFixed(2)})`}
                          </div>
                        )}
                        {afterSale?.merchantNote && (
                          <div className="text-[11px] text-blue-700 pt-1 border-t border-blue-100">
                            商家备注: {afterSale.merchantNote}
                          </div>
                        )}
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

                  {/* 
                    ===== 合并订单详情页核心内容 =====
                  */}

                  {/* 1. 订单编号与关键时间信息 (从 OrderDetailModal 完整合并) */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-1.5 text-xs text-gray-600">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      订单基本信息与时间
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">订单编号:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-gray-900">{detailOrder.orderNo}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNo(detailOrder.orderNo)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded transition cursor-pointer"
                          title="复制单号"
                        >
                          {copiedOrderNo ? <Check className="w-3 h-3 text-[#00B578]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">下单时间:</span>
                      <span className="font-mono text-gray-700">{detailOrder.createTime}</span>
                    </div>

                    {/* 客户预约自提时间 (仅线上自提展示) */}
                    {detailOrder.channel !== 'offline' && (detailOrder.selectedPickupTime || detailOrder.createTime) && (
                      <div className="flex items-center justify-between text-emerald-800 font-medium">
                        <span className="text-emerald-700 font-bold">客户自提时间:</span>
                        <span className="font-mono font-bold">
                          {formatPickupTimePoint(detailOrder.selectedPickupTime || detailOrder.createTime)}
                        </span>
                      </div>
                    )}

                    {detailOrder.payTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">付款时间:</span>
                        <span className="font-mono text-gray-700">{detailOrder.payTime}</span>
                      </div>
                    )}

                    {/* 核销提货时间 */}
                    {detailOrder.channel !== 'offline' && detailOrder.fulfillment?.verifyTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-medium">核销提货时间:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {detailOrder.fulfillment.verifyTime}
                        </span>
                      </div>
                    )}

                    {/* 自提核销码 */}
                    {detailOrder.channel !== 'offline' && detailOrder.fulfillment?.pickupCode && (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-emerald-700 font-bold">自提核销码:</span>
                        <span className="font-mono font-black text-sm text-[#00B578] tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                          {detailOrder.fulfillment.pickupCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. 顾客信息 (从 OrderDetailModal 完整合并) */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-1.5">
                    <div className="text-xs font-black text-gray-800 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-[#00B578]" />
                      <span>顾客信息</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 space-y-1 text-xs text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900">
                          {detailOrder.fulfillment?.receiverName || '顾客'}
                        </span>
                        <span className="font-mono text-gray-700 font-bold flex items-center space-x-1">
                          <span>{detailOrder.fulfillment?.receiverPhone || '138****5621'}</span>
                          <Phone className="w-3.5 h-3.5 text-[#00B578]" />
                        </span>
                      </div>
                      {!isPickup && detailOrder.fulfillment?.pickupAddress && (
                        <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                          配送地址: {detailOrder.fulfillment.pickupAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. 购买的商品明细 (标签置于价格上面，从 OrderDetailModal 完整合并) */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-gray-800">
                      <div className="flex items-center space-x-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#00B578]" />
                        <span>购买的商品明细</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-normal">
                        共 {detailOrder.items?.reduce((s, i) => s + i.quantity, 0) || 1} 件
                      </span>
                    </div>

                    <div className="space-y-2">
                      {detailOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100"
                        >
                          <img
                            src={item.imageSnapshot}
                            alt={item.titleSnapshot}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-gray-900 truncate">
                              {item.titleSnapshot}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">
                              规格: {item.specSnapshot || '标准份'}
                            </div>

                            {/* 到店自提的标签放在价格上面 (User Requirement 5) */}
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[9px] font-black border ${
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

                            <div className="flex items-baseline justify-between mt-1 text-xs">
                              <span className="text-gray-500 text-[11px] font-sans">
                                ¥{item.priceSnapshot.toFixed(2)} × {item.quantity}
                              </span>
                              <span className="font-black text-gray-900 font-sans">
                                ¥{(item.priceSnapshot * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. 订单金额、让利优惠与实付核算 (从 OrderDetailModal 完整合并) */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs border border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>订单商品总额</span>
                      <span className="font-bold text-gray-900 font-sans">
                        ¥{detailOrder.goodsAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>让利优惠 (PV)</span>
                      <span className="font-bold font-sans">
                        -{(detailOrder.rebateDiscount || 0).toFixed(2)} PV
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>通宝/积分已抵扣</span>
                      <span className="font-bold font-sans">
                        -¥{(detailOrder.pointDeductAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-gray-900">
                      <span className="font-bold">顾客实付金额</span>
                      <span className="text-base font-black text-[#00B578] font-sans">
                        ¥{detailOrder.payAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 详情页底部操作栏 (驳回、同意换货/退款) */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between shrink-0 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailOrder(null)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
                    >
                      返回售后列表
                    </button>
                    {type === 'exchange' && (
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintExchangeReceipt(detailOrder);
                        }}
                        className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                        title="打印换货小票"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>打印换货小票</span>
                      </button>
                    )}
                  </div>

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
                          驳回
                        </button>

                        {/* 同意换货 (唤起换货商品信息修改弹窗) vs 同意退款 */}
                        {type === 'exchange' ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenExchangeModal(detailOrder);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>同意换货</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              handleApprove(detailOrder);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {isPickup ? '同意退款' : '审核通过'}
                            </span>
                          </button>
                        )}
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

      {/* 
        5. 驳回售后申请弹窗 (User Requirement 2: 拒绝申请改为驳回)
      */}
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
                  <span>驳回售后申请</span>
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
                    placeholder="请输入详细驳回原因反馈给买家..."
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

      {/* 
        6. Thermal Receipt Printing Modal
      */}
      {receiptPrintOrder && (
        <ThermalReceiptModal
          order={receiptPrintOrder}
          onClose={() => setReceiptPrintOrder(null)}
          onShowToast={onShowToast}
        />
      )}

      {/* 
        7. Image Fullscreen Preview Modal
      */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] flex items-center justify-center">
            <img
              src={previewImage}
              alt="凭证大图"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
