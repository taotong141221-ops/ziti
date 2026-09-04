import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Clock,
  RotateCcw,
  CheckCircle2,
  FileText,
  Printer,
  PackageCheck,
  ShoppingBag,
  Store,
  Calendar,
  Layers,
  Eye,
  Edit3,
  AlertCircle,
  X,
  Tag,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';
import { speakText, playChime } from '../../utils/audio';
import { PickupVerifyModal } from './PickupVerifyModal';
import { CustomDatePickerModal } from './CustomDatePickerModal';
import { OrderDetailModal } from './OrderDetailModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';

export interface OrderItemSpec {
  title: string;
  spec: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface MerchantOrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone?: string;
  customerAvatar: string;
  customerAddress?: string;
  consumeTimesTag: string; // e.g. "在本店消费2次"
  statusText: string; // e.g. "付款成功" | "待付款"
  time: string; // 下单时间 e.g. "2026-08-27 19:38:56"
  pickupTime?: string; // 客户自提时间 e.g. "2026-08-27 19:38:56"
  payTime?: string;
  orderAmount: number;
  payAmount: number;
  rebateDiscount: number;
  deductedAmount: number;
  fulfillType: 'pickup';
  channel?: 'online' | 'offline'; // 线上 / 线下
  isReady?: boolean;
  readyTime?: string;
  pickupStatus?: 'pending' | 'completed';
  pickupCode?: string;
  verifiedTime?: string;
  isRefunded?: boolean;
  refundTime?: string;
  isToday?: boolean;
  isUnpaid?: boolean; // 是否未付款 (消费者发起订单未付款)
  printCount?: number; // 小票打印次数
  originalPayAmount?: number; // 商家改价前原需付金额
  isPriceModified?: boolean; // 商家是否已修改价格
  priceModifyReason?: string; // 改价原因/备注
  // 换货小票相关信息
  isExchangeReceipt?: boolean;
  exchangeInfo?: {
    exchangeTime: string;
    newProductTitle: string;
    newSpec?: string;
    newQuantity: number;
    newPrice: number;
    oldProductTitle?: string;
    diffAmount?: number;
    merchantNote?: string;
  };
  items: OrderItemSpec[];
}

interface MerchantOrdersViewProps {
  orders?: Order[];
  onRefundOffline?: (orderId: string) => void;
  onlineRevenue?: number;
  totalOrdersCount?: number;
  offlineRefundCount?: number;
  onMarkOrderReady?: (orderNo: string) => void;
}

export const formatPickupTimePoint = (time?: string): string => {
  if (!time) return '18:40';
  const trimmed = time.trim();
  const noRange = trimmed.includes('-') && !trimmed.includes('2026-') ? trimmed.split('-')[0].trim() : trimmed;
  const timePart = noRange.includes(' ')
    ? noRange.split(' ').find((p) => p.includes(':')) || noRange.split(' ')[1] || noRange
    : noRange;
  const sub = timePart.split(':');
  if (sub.length >= 2) {
    return `${sub[0].padStart(2, '0')}:${sub[1].padStart(2, '0')}`;
  }
  return timePart || '18:40';
};

const DEFAULT_ORDERS: MerchantOrderItem[] = [
  // 消费者发起订单未付款 (未付款列表，商家可修改价格)
  {
    id: 'mo_unpaid_1',
    orderNo: 'SF20260827000028',
    customerName: '李梦婷',
    customerPhone: '139****5821',
    customerAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费1次',
    statusText: '待付款',
    time: '2026-08-27 19:42:10',
    pickupTime: '2026-08-27 20:30:00',
    orderAmount: 58.0,
    payAmount: 52.2,
    rebateDiscount: 5.8,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: false,
    isRefunded: false,
    isToday: true,
    isUnpaid: true,
    pickupStatus: 'pending',
    items: [
      {
        title: '老街坊秘制红烧牛肉面',
        spec: '豪华加肉加蛋碗 (双倍肉)',
        price: 26.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '秘制卤香牛腱切盘',
        spec: '150g配秘制香辣蘸料',
        price: 32.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_unpaid_2',
    orderNo: 'SF20260827000029',
    customerName: '张建国',
    customerPhone: '186****9033',
    customerAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费4次',
    statusText: '待付款',
    time: '2026-08-27 19:15:22',
    pickupTime: '2026-08-27 20:00:00',
    orderAmount: 38.0,
    payAmount: 34.2,
    rebateDiscount: 3.8,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: false,
    isRefunded: false,
    isToday: true,
    isUnpaid: true,
    pickupStatus: 'pending',
    items: [
      {
        title: '特制酸汤肥牛面',
        spec: '特浓金汤大碗 (含双倍肥牛)',
        price: 32.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '老北京手工酸梅汤 (500ml冰镇)',
        spec: '500ml微甜少冰 (手工慢熬)',
        price: 6.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000111_1',
    orderNo: 'SF20260827000005',
    customerName: '张树鹏',
    customerPhone: '138****5621',
    customerAvatar:
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费2次',
    statusText: '付款成功',
    time: '2026-08-27 19:38:56',
    pickupTime: '2026-08-27 19:38:56',
    payTime: '2026-08-27 19:38:58',
    orderAmount: 48.0,
    payAmount: 10.0,
    rebateDiscount: 4.8,
    deductedAmount: 38.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: false,
    isRefunded: false,
    isToday: true,
    pickupStatus: 'pending',
    pickupCode: '394821',
    items: [
      {
        title: '老街坊秘制红烧牛肉面',
        spec: '豪华加肉加蛋碗',
        price: 26.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '手作香脆炸油条 (2根)',
        spec: '外酥里嫩',
        price: 6.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '秘制五香卤蛋 (1个)',
        spec: '入味醇香',
        price: 3.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000111_2',
    orderNo: 'SF20260827000004',
    customerName: '李思雨',
    customerPhone: '139****8821',
    customerAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费5次',
    statusText: '待自提',
    time: '2026-08-27 18:15:20',
    pickupTime: '2026-08-27 18:15:20',
    payTime: '2026-08-27 18:15:22',
    orderAmount: 68.0,
    payAmount: 38.0,
    rebateDiscount: 6.8,
    deductedAmount: 30.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: true,
    readyTime: '18:20:15',
    pickupStatus: 'pending',
    pickupCode: '784912',
    isRefunded: false,
    isToday: true,
    printCount: 1,
    items: [
      {
        title: '老街坊秘制红烧牛肉面',
        spec: '标准碗 (含大块牛肉)',
        price: 18.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '秘制卤香牛腱切盘',
        spec: '150g配秘制蘸料',
        price: 32.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000111_today_offline_1',
    orderNo: 'SF20260827000007',
    customerName: '王建国',
    customerPhone: '137****1122',
    customerAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    customerAddress: '门店现场消费 (线下买单)',
    consumeTimesTag: '在本店消费3次',
    statusText: '已完成',
    time: '2026-08-27 16:30:15',
    payTime: '2026-08-27 16:30:18',
    orderAmount: 35.0,
    payAmount: 35.0,
    rebateDiscount: 3.5,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'offline',
    isReady: true,
    readyTime: '16:35:00',
    pickupStatus: 'completed',
    isRefunded: false,
    isToday: true,
    items: [
      {
        title: '老街坊精品牛肉面套餐',
        spec: '套餐配小菜',
        price: 35.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000111_today_offline_refund',
    orderNo: 'SF20260827000008',
    customerName: '赵云海',
    customerPhone: '158****6633',
    customerAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    customerAddress: '门店现场消费 (线下买单)',
    consumeTimesTag: '在本店消费2次',
    statusText: '已退款',
    time: '2026-08-27 15:20:00',
    payTime: '2026-08-27 15:20:10',
    orderAmount: 42.0,
    payAmount: 42.0,
    rebateDiscount: 4.2,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'offline',
    isReady: true,
    readyTime: '15:22:00',
    pickupStatus: 'completed',
    isRefunded: true,
    refundTime: '2026-08-27 15:45:00',
    isToday: true,
    items: [
      {
        title: '老街坊招牌红烧牛肉面 (大份)',
        spec: '大份加辣',
        price: 28.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
      {
        title: '手作香脆炸油条 (2根)',
        spec: '现炸酥脆',
        price: 7.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000111_today_pickup_refund',
    orderNo: 'SF20260827000009',
    customerName: '郭建平',
    customerPhone: '188****7712',
    customerAvatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费4次',
    statusText: '已退款',
    time: '2026-08-27 14:10:00',
    pickupTime: '2026-08-27 14:10:00',
    payTime: '2026-08-27 14:10:05',
    orderAmount: 32.0,
    payAmount: 32.0,
    rebateDiscount: 3.2,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: true,
    readyTime: '14:15:00',
    isRefunded: true,
    refundTime: '2026-08-27 14:35:10',
    isToday: true,
    items: [
      {
        title: '秘制卤香牛腱切盘',
        spec: '150g配秘制蘸料',
        price: 32.0,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000109_4',
    orderNo: 'SF20260826000003',
    customerName: '王凯文',
    customerPhone: '136****9912',
    customerAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费1次',
    statusText: '待自提',
    time: '2026-08-26 19:42:10',
    pickupTime: '2026-08-26 19:42:10',
    payTime: '2026-08-26 19:42:12',
    orderAmount: 52.0,
    payAmount: 22.0,
    rebateDiscount: 5.2,
    deductedAmount: 30.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: true,
    readyTime: '19:48:00',
    pickupStatus: 'pending',
    pickupCode: '619283',
    isRefunded: false,
    isToday: false,
    items: [
      {
        title: '老街坊秘制红烧牛肉面',
        spec: '豪华双倍肉',
        price: 26.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000108_5',
    orderNo: 'SF20260826000002',
    customerName: '陈晓琳',
    customerPhone: '150****3344',
    customerAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    customerAddress: '门店现场消费 (线下买单)',
    consumeTimesTag: '在本店消费8次',
    statusText: '已完成',
    time: '2026-08-26 12:30:05',
    payTime: '2026-08-26 12:30:08',
    orderAmount: 85.03,
    payAmount: 85.03,
    rebateDiscount: 8.5,
    deductedAmount: 0.0,
    fulfillType: 'pickup',
    channel: 'offline',
    isReady: true,
    readyTime: '12:35:10',
    pickupStatus: 'completed',
    isRefunded: false,
    isToday: false,
    items: [
      {
        title: '老街坊精品牛肉面套餐',
        spec: '含牛肉面+小菜+豆浆',
        price: 28.0,
        quantity: 3,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'mo_1000107_6',
    orderNo: 'SF20260826000001',
    customerName: '赵志刚',
    customerPhone: '135****6677',
    customerAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    customerAddress: '到店自提 (老街坊红谷滩绿茵路店)',
    consumeTimesTag: '在本店消费3次',
    statusText: '已核销提货',
    time: '2026-08-26 11:10:00',
    pickupTime: '2026-08-26 11:10:00',
    payTime: '2026-08-26 11:10:02',
    orderAmount: 36.0,
    payAmount: 18.0,
    rebateDiscount: 3.6,
    deductedAmount: 18.0,
    fulfillType: 'pickup',
    channel: 'online',
    isReady: true,
    readyTime: '11:15:00',
    pickupStatus: 'completed',
    pickupCode: '582910',
    verifiedTime: '2026-08-26 11:42:30',
    isRefunded: false,
    isToday: false,
    items: [
      {
        title: '老街坊秘制红烧牛肉面',
        spec: '标准碗 (含大块牛肉)',
        price: 18.0,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
];

export const MerchantOrdersView: React.FC<MerchantOrdersViewProps> = ({
  orders: propOrders,
  onRefundOffline,
  onlineRevenue = 263.03,
  totalOrdersCount = 12,
  onMarkOrderReady,
}) => {
  const [orders, setOrders] = useState<MerchantOrderItem[]>(DEFAULT_ORDERS);

  // Filters State: orderScope ('today' | 'all') + Time Range for 'all' + Status Filter
  const [orderScope, setOrderScope] = useState<'today' | 'all'>('today');
  const [timePreset, setTimePreset] = useState<'all' | 'today' | 'yesterday' | '7days' | 'custom'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'pending_ready' | 'pending_pickup' | 'completed' | 'refunded'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-06-27');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-28');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Modals State
  const [detailModalOrder, setDetailModalOrder] = useState<MerchantOrderItem | null>(null);
  const [verifyModalOrder, setVerifyModalOrder] = useState<MerchantOrderItem | null>(null);
  const [printReceiptOrder, setPrintReceiptOrder] = useState<MerchantOrderItem | null>(null);
  const [refundTarget, setRefundTarget] = useState<MerchantOrderItem | null>(null);

  // Modify Price Modal State (消费者发起未付款订单，商家可修改价格)
  const [modifyPriceOrder, setModifyPriceOrder] = useState<MerchantOrderItem | null>(null);
  const [modifyPriceValue, setModifyPriceValue] = useState<number>(0);
  const [modifyPriceReason, setModifyPriceReason] = useState<string>('常客特惠/协商减价');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Group 1: 累计统计
  const totalOrdersCountCalc = orders.length > 0 ? orders.length : totalOrdersCount;
  const totalPickupCount = orders.length;
  const totalVerifiedCount = orders.filter((o) => o.pickupStatus === 'completed').length;

  // Group 2: 今日统计
  const todayOrders = orders.filter((o) => o.isToday);
  const todayPickupCount = todayOrders.length;
  const todayUnpaidCount = todayOrders.filter((o) => o.isUnpaid || o.statusText === '待付款').length;
  const totalUnpaidCount = orders.filter((o) => o.isUnpaid || o.statusText === '待付款').length;
  const todayPendingReadyCount = todayOrders.filter(
    (o) => !o.isReady && !o.isRefunded && !o.isUnpaid && o.statusText !== '待付款' && o.channel !== 'offline'
  ).length;
  const todayPendingPickupCount = todayOrders.filter(
    (o) => o.isReady && o.pickupStatus !== 'completed' && !o.isRefunded && !o.isUnpaid && o.statusText !== '待付款'
  ).length;
  const todayPickupRefundCount = todayOrders.filter((o) => o.isRefunded).length;

  // Multi-dimensional Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.time.split(' ')[0] || '';

      // 1. Order Scope: 今日订单 vs 全部订单 (参考图2)
      if (orderScope === 'today') {
        if (!order.isToday && !orderDate.startsWith('2026-08-27')) return false;
      } else {
        // 2. 全部订单下的时间筛选
        if (timePreset === 'today') {
          if (!order.isToday && !orderDate.startsWith('2026-08-27')) return false;
        } else if (timePreset === 'yesterday') {
          if (!orderDate.startsWith('2026-08-26')) return false;
        } else if (timePreset === '7days') {
          if (orderDate < '2026-08-20') return false;
        } else if (timePreset === 'custom') {
          if (customStartDate && orderDate < customStartDate) return false;
          if (customEndDate && orderDate > customEndDate) return false;
        }
      }

      // 3. Status Filter (状态筛选：未付款、待备货、待自提、已完成、已退款)
      if (statusFilter === 'unpaid') {
        if (!order.isUnpaid && order.statusText !== '待付款') return false;
      } else if (statusFilter === 'pending_ready') {
        if (order.isUnpaid || order.statusText === '待付款' || order.isRefunded || order.isReady || order.channel === 'offline') return false;
      } else if (statusFilter === 'pending_pickup') {
        if (order.isUnpaid || order.statusText === '待付款' || order.isRefunded || !order.isReady || order.pickupStatus === 'completed' || order.channel === 'offline') return false;
      } else if (statusFilter === 'completed') {
        if (order.isRefunded || order.isUnpaid || order.statusText === '待付款' || (order.channel !== 'offline' && order.pickupStatus !== 'completed')) return false;
      } else if (statusFilter === 'refunded') {
        if (!order.isRefunded) return false;
      }

      return true;
    });
  }, [orders, orderScope, timePreset, customStartDate, customEndDate, statusFilter]);

  // Action: Open Modify Price Modal
  const handleOpenModifyPrice = (order: MerchantOrderItem) => {
    setModifyPriceOrder(order);
    setModifyPriceValue(order.payAmount);
    setModifyPriceReason(order.priceModifyReason || '常客特惠/协商减价');
  };

  // Action: Confirm Modify Price
  const handleConfirmModifyPrice = () => {
    if (!modifyPriceOrder) return;
    const finalPrice = Math.max(0.01, parseFloat(Number(modifyPriceValue).toFixed(2)));
    const originalPrice = modifyPriceOrder.originalPayAmount ?? modifyPriceOrder.payAmount;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === modifyPriceOrder.id
          ? {
              ...o,
              payAmount: finalPrice,
              isPriceModified: true,
              originalPayAmount: originalPrice,
              priceModifyReason: modifyPriceReason,
            }
          : o
      )
    );

    if (detailModalOrder && detailModalOrder.id === modifyPriceOrder.id) {
      setDetailModalOrder((prev) =>
        prev
          ? {
              ...prev,
              payAmount: finalPrice,
              isPriceModified: true,
              originalPayAmount: originalPrice,
              priceModifyReason: modifyPriceReason,
            }
          : null
      );
    }

    setModifyPriceOrder(null);
    playChime();
    speakText(`订单价格已修改为 ${finalPrice} 元！`);
    showToast(`订单 ${modifyPriceOrder.orderNo} 实付金额已成功修改为 ¥${finalPrice.toFixed(2)}`);
  };

  // Action: Mark as Ready
  const handleMarkReady = (order: MerchantOrderItem) => {
    const timeStr = new Date().toLocaleTimeString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              isReady: true,
              readyTime: timeStr,
            }
          : o
      )
    );
    if (detailModalOrder && detailModalOrder.id === order.id) {
      setDetailModalOrder((prev) => (prev ? { ...prev, isReady: true, readyTime: timeStr } : null));
    }
    if (onMarkOrderReady) {
      onMarkOrderReady(order.orderNo);
    }
    playChime();
    speakText(`订单 ${order.orderNo.slice(-4)} 已备货完毕！`);
    showToast(`订单 ${order.orderNo} 已标记为备货完成`);
  };

  // Action: Verify Pickup Code (自提核销成功)
  const handleConfirmVerifyCode = (order: MerchantOrderItem, code: string) => {
    const timeStr = new Date().toLocaleString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              isReady: true,
              pickupStatus: 'completed',
              statusText: '已核销提货',
              verifiedTime: timeStr,
            }
          : o
      )
    );
    setVerifyModalOrder(null);
    playChime();
    speakText(`自提订单 ${order.orderNo.slice(-4)} 提货码核销成功！`);
    showToast(`订单 ${order.orderNo} 提货码核销成功，已完成自提！`);
  };

  // Action: Offline Refund
  const handleConfirmRefund = () => {
    if (!refundTarget) return;
    const timeStr = new Date().toLocaleString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === refundTarget.id
          ? {
              ...o,
              isRefunded: true,
              statusText: '已退款',
              refundTime: timeStr,
            }
          : o
      )
    );
    if (onRefundOffline) {
      onRefundOffline(refundTarget.id);
    }
    playChime();
    speakText(`订单 ${refundTarget.orderNo.slice(-4)} 线下退款成功！`);
    showToast(`订单 ${refundTarget.orderNo} 线下全额退款成功！`);
    setRefundTarget(null);
  };

  const renderStatusBadge = (order: MerchantOrderItem) => {
    if (order.isUnpaid || order.statusText === '待付款') {
      return (
        <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0 animate-pulse">
          <Clock className="w-3 h-3 text-rose-500" />
          <span>待付款</span>
        </span>
      );
    }
    if (order.isRefunded) {
      return (
        <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
          <RotateCcw className="w-3 h-3" />
          <span>已退款</span>
        </span>
      );
    }
    if (order.channel === 'offline') {
      return (
        <span className="bg-emerald-50 text-[#00B578] border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>已完成</span>
        </span>
      );
    }
    if (order.pickupStatus === 'completed') {
      return (
        <span className="bg-emerald-50 text-[#00B578] border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>自提完成</span>
        </span>
      );
    }
    if (order.isReady) {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>待自提</span>
        </span>
      );
    }
    return (
      <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
        <Clock className="w-3 h-3" />
        <span>待备货</span>
      </span>
    );
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-y-auto no-scrollbar relative select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none flex items-center space-x-1.5 backdrop-blur-xs whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00B578]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Statistics Area */}
      <div className="bg-gradient-to-b from-[#DCF4EC] via-[#E8F8F2] to-[#F5F7FA] px-4 pt-3 pb-2 shrink-0 space-y-3">
        {/* Top Summary Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/90 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium tracking-tight">在线实收资金</span>
            <div className="bg-[#F2F4F7] text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
              <span>{orderScope === 'today' ? '今日实时' : timePreset === 'today' ? '今日' : timePreset === 'yesterday' ? '昨日' : timePreset === '7days' ? '近7天' : timePreset === 'custom' ? `${customStartDate.slice(5)}~${customEndDate.slice(5)}` : '全部时间'}</span>
            </div>
          </div>

          <div className="mt-1 flex items-baseline space-x-0.5">
            <span className="text-sm font-black text-[#00B578] mr-1">¥</span>
            <span className="text-[28px] font-black text-[#00B578] tracking-tight font-sans leading-none">
              {onlineRevenue.toFixed(2)}
            </span>
          </div>

          {/* Statistics Grid */}
          <div className="mt-3.5 space-y-2.5">
            <div className="bg-[#F8F9FB] rounded-xl p-2.5 border border-gray-100/70">
              <div className="grid grid-cols-5 gap-1">
                <div className="bg-white rounded-lg p-1.5 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block truncate">今日自提</span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block leading-tight">
                    {todayPickupCount}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-1.5 border border-rose-100 shadow-2xs text-center bg-rose-50/20">
                  <span className="text-[10px] text-rose-500 font-bold block truncate">待付款</span>
                  <span className="text-sm font-black text-rose-600 mt-0.5 block leading-tight">
                    {todayUnpaidCount}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-1.5 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block truncate">待备货</span>
                  <span className="text-sm font-black text-orange-500 mt-0.5 block leading-tight">
                    {todayPendingReadyCount}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-1.5 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block truncate">待自提</span>
                  <span className="text-sm font-black text-amber-600 mt-0.5 block leading-tight">
                    {todayPendingPickupCount}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-1.5 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block truncate">自提退单</span>
                  <span className="text-sm font-black text-rose-500 mt-0.5 block leading-tight">
                    {todayPickupRefundCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9FB] rounded-xl p-2.5 border border-gray-100/70">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block">累计订单数</span>
                  <span className="text-base font-black text-gray-900 mt-0.5 block leading-tight">
                    {totalOrdersCountCalc}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block">累计自提</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block leading-tight">
                    {totalPickupCount}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-2xs text-center">
                  <span className="text-[10px] text-gray-500 font-medium block">累计已核销</span>
                  <span className="text-base font-black text-teal-600 mt-0.5 block leading-tight">
                    {totalVerifiedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 顶部主 Tab: 今日订单 | 全部订单 (参考图2) */}
        <div className="bg-white rounded-2xl p-3 border border-gray-100/90 shadow-2xs space-y-2.5">
          <div className="flex items-center space-x-6 px-1 border-b border-gray-100/70 pb-2">
            <button
              type="button"
              onClick={() => {
                setOrderScope('today');
                setTimePreset('today');
              }}
              className={`relative pb-1 text-sm font-bold transition cursor-pointer flex items-center ${
                orderScope === 'today'
                  ? 'text-gray-900 font-black'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
              id="tab-today-orders"
            >
              <span>今日订单</span>
              {orderScope === 'today' && (
                <motion.div
                  layoutId="merchantOrderTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00B578] rounded-full"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderScope('all');
                setTimePreset('all');
              }}
              className={`relative pb-1 text-sm font-bold transition cursor-pointer flex items-center ${
                orderScope === 'all'
                  ? 'text-gray-900 font-black'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
              id="tab-all-orders"
            >
              <span>全部订单</span>
              {orderScope === 'all' && (
                <motion.div
                  layoutId="merchantOrderTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00B578] rounded-full"
                />
              )}
            </button>
          </div>

          {/* 状态分类标签: 全部、待付款(未付款订单列表)、待备货、待自提、已完成、已退款 */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {[
              { id: 'all', label: '全部' },
              {
                id: 'unpaid',
                label: '待付款',
                badge: orderScope === 'today' ? todayUnpaidCount : totalUnpaidCount,
              },
              { id: 'pending_ready', label: '待备货' },
              { id: 'pending_pickup', label: '待自提' },
              { id: 'completed', label: '已完成' },
              { id: 'refunded', label: '已退款' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                  statusFilter === tab.id
                    ? 'bg-[#00B578] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-gray-600 hover:bg-gray-200/80'
                }`}
                id={`status-filter-${tab.id}`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                      statusFilter === tab.id ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 全部订单模式下的时间筛选芯片 */}
          {orderScope === 'all' && (
            <div className="pt-1 flex items-center space-x-1.5 overflow-x-auto no-scrollbar border-t border-gray-100/60">
              {[
                { id: 'all', label: '全部时间' },
                { id: 'today', label: '今日' },
                { id: 'yesterday', label: '昨日' },
                { id: '7days', label: '近7日' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimePreset(t.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    timePreset === t.id
                      ? 'bg-[#00B578] text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-gray-600 hover:bg-gray-200/80'
                  }`}
                  id={`filter-time-${t.id}`}
                >
                  {t.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCustomPicker(true)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center space-x-1 transition cursor-pointer ${
                  timePreset === 'custom'
                    ? 'bg-[#00B578] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-gray-600 hover:bg-gray-200/80'
                }`}
                id="filter-time-custom"
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {timePreset === 'custom'
                    ? `${customStartDate.slice(5)} ~ ${customEndDate.slice(5)}`
                    : '自定义时间 ▾'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="flex-1 px-3.5 pt-1 pb-24 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400 text-xs mt-2">
            暂无匹配订单数据
          </div>
        ) : (
          filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                onClick={() => setDetailModalOrder(order)}
                className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-2.5 transition cursor-pointer hover:border-emerald-300 hover:shadow-xs active:bg-gray-50/70"
                id={`merchant-order-card-${order.orderNo}`}
              >
                {/* Card Header: Avatar, Name, Badge, Channel & Fulfill Badge, Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={order.customerAvatar}
                      alt={order.customerName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      {/* 顾客姓名与消费频次 */}
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-sm font-black text-gray-900 truncate">
                          {order.customerName}
                        </span>
                        <span className="bg-[#FFF3EC] text-[#FF6B35] text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0">
                          {order.consumeTimesTag}
                        </span>
                      </div>

                      {/* 已改价标签放在名字下面；线上、线下的标签放在已改价后面 */}
                      <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-1">
                        {order.isPriceModified && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-bold border border-blue-200 shrink-0">
                            已改价
                          </span>
                        )}

                        {/* 渠道标签 (线上 / 线下) 放在已改价后面 */}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                            order.channel === 'offline'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {order.channel === 'offline' ? '线下' : '线上'}
                        </span>

                        {/* 到店自提 标签 (仅线上自提订单展示，线下没有自提信息) */}
                        {order.channel !== 'offline' && (
                          <span className="bg-emerald-50 text-[#00B578] border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-md flex items-center space-x-0.5 shrink-0">
                            <ShoppingBag className="w-2.5 h-2.5" />
                            <span>到店自提</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        下单时间: {order.time}
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Status Badge */}
                  <div className="shrink-0">{renderStatusBadge(order)}</div>
                </div>

                {/* 客户自提时间 (仅线上自提订单展示，线下订单无自提信息) */}
                {order.channel !== 'offline' && (order.pickupTime || order.time) && (
                  <div className="bg-[#F8FAF9] rounded-xl px-3 py-2 border border-emerald-100/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold">客户自提时间:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {formatPickupTimePoint(order.pickupTime || order.time)}
                      </span>
                    </div>
                    {order.pickupCode && !order.isRefunded && order.pickupStatus !== 'completed' && (
                      <span className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                        提货码: {order.pickupCode}
                      </span>
                    )}
                  </div>
                )}

                {/* 金额快速概览 (列表不放冗余明细，保持整洁，点击卡片即可查看完整详情) */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100/80 text-gray-500">
                  <div>
                    订单总额: <span className="font-mono font-bold text-gray-800">¥{order.orderAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    让利: <span className="font-mono text-emerald-600 font-bold">-{order.rebateDiscount.toFixed(2)} PV</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{order.isUnpaid || order.statusText === '待付款' ? '应付:' : '实收:'}</span>
                    <span className="font-mono font-black text-rose-600 text-sm">¥{order.payAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Bottom Action Buttons: 打印小票 | 修改价格 (未付款) | 已备货 / 核销 | 线下退款 */}
                <div className="border-t border-gray-50 pt-2 flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center space-x-1.5">
                    {/* 打印小票 Button (待付款与已退款状态去掉打印小票按钮) */}
                    {!(order.isUnpaid || order.statusText === '待付款' || order.isRefunded || order.statusText === '已退款') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintReceiptOrder(order);
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                        id={`btn-print-receipt-${order.orderNo}`}
                      >
                        <Printer className="w-3 h-3 text-gray-600" />
                        <span>打印小票</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* 消费者发起未付款订单：商家修改价格操作 */}
                    {(order.isUnpaid || order.statusText === '待付款') ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModifyPrice(order);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 flex items-center space-x-1.5 transition"
                        id={`btn-modify-price-${order.orderNo}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>修改价格</span>
                      </button>
                    ) : (
                      <>
                        {/* 业务操作: 仅线上自提订单支持 已备货 / 核销 */}
                        {order.channel !== 'offline' && !order.isRefunded && (
                          <>
                            {!order.isReady ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkReady(order);
                                }}
                                className="px-2.5 py-1 bg-[#00B578] hover:bg-[#009e68] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 flex items-center space-x-1 transition"
                                id={`btn-pickup-ready-${order.orderNo}`}
                              >
                                <PackageCheck className="w-3 h-3" />
                                <span>已备货</span>
                              </button>
                            ) : order.pickupStatus !== 'completed' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVerifyModalOrder(order);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 flex items-center space-x-1 transition"
                                id={`btn-pickup-verify-${order.orderNo}`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>核销</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.8 rounded-lg font-bold border border-emerald-200/60 flex items-center space-x-0.5">
                                <CheckCircle2 className="w-3 h-3 text-[#00B578]" />
                                <span>已核销</span>
                              </span>
                            )}
                          </>
                        )}

                        {/* 线下退款 Button */}
                        {order.isRefunded ? (
                          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.8 rounded-lg">
                            已退款
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRefundTarget(order);
                            }}
                            className="px-2 py-1 border border-[#FF4D4F] text-[#FF4D4F] hover:bg-rose-50 rounded-lg text-xs font-medium transition cursor-pointer"
                            id={`btn-refund-${order.orderNo}`}
                          >
                            线下退款
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: 提货码核销弹窗 (Request 3: 确认自提按钮增加交互，点击后弹窗输入自提码) */}
      <AnimatePresence>
        {verifyModalOrder && (
          <PickupVerifyModal
            order={verifyModalOrder}
            onClose={() => setVerifyModalOrder(null)}
            onConfirmVerify={handleConfirmVerifyCode}
          />
        )}
      </AnimatePresence>

      {/* Modal 2: 自定义时间范围弹窗 (Request 6 & Image 4) */}
      <AnimatePresence>
        {showCustomPicker && (
          <CustomDatePickerModal
            isOpen={showCustomPicker}
            onClose={() => setShowCustomPicker(false)}
            startDate={customStartDate}
            endDate={customEndDate}
            onConfirm={(s, e) => {
              setCustomStartDate(s);
              setCustomEndDate(e);
              setTimePreset('custom');
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 3: 订单详情弹窗 (Request 1 & Image 1) */}
      <AnimatePresence>
        {detailModalOrder && (
          <OrderDetailModal
            order={detailModalOrder}
            onClose={() => setDetailModalOrder(null)}
            onPrintReceipt={(ord) => {
              setDetailModalOrder(null);
              setPrintReceiptOrder(ord);
            }}
            onVerifyPickup={(ord) => {
              setDetailModalOrder(null);
              setVerifyModalOrder(ord);
            }}
            onModifyPrice={(ord) => {
              setDetailModalOrder(null);
              handleOpenModifyPrice(ord);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 4: 热敏小票打印预览弹窗 */}
      <AnimatePresence>
        {printReceiptOrder && (
          <ThermalReceiptModal
            order={printReceiptOrder}
            onClose={() => setPrintReceiptOrder(null)}
            onShowToast={showToast}
            onPrintSuccess={(orderNo, newCount) => {
              setOrders((prev) =>
                prev.map((o) => (o.orderNo === orderNo ? { ...o, printCount: newCount } : o))
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 5: 线下退款确认对话框 */}
      <AnimatePresence>
        {refundTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3.5"
            >
              <div className="flex items-center space-x-2 text-rose-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-black text-gray-900">确认进行线下全额退款？</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                订单号: <b className="font-mono text-gray-700">{refundTarget.orderNo}</b>
                <br />
                实付金额: <b className="text-rose-600">¥{refundTarget.payAmount.toFixed(2)}</b>
                <br />
                确认退款后，此订单金额将记入线下已退款统计中。
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  className="flex-1 py-2 bg-[#FF4D4F] hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  确认已退款
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 6: 商家修改未付款订单价格弹窗 (消费者发起订单未付款，商家可修改价格) */}
      <AnimatePresence>
        {modifyPriceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <span>修改未付款订单应付金额</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModifyPriceOrder(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Info Card */}
              <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">订单号</span>
                  <span className="font-mono font-bold text-gray-800">{modifyPriceOrder.orderNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">下单顾客</span>
                  <span className="font-bold text-gray-800">{modifyPriceOrder.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">原订单总额</span>
                  <span className="font-mono text-gray-700">¥{modifyPriceOrder.orderAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                  <span className="text-gray-500 font-medium">当前需付金额</span>
                  <span className="font-mono font-bold text-gray-900">
                    ¥{(modifyPriceOrder.originalPayAmount ?? modifyPriceOrder.payAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Price Modifier Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  商家调整后实付金额 (元)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-lg font-black text-rose-600 font-sans">¥</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={modifyPriceValue}
                    onChange={(e) => setModifyPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-20 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-lg font-black text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-sans"
                    placeholder="0.00"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setModifyPriceValue((prev) => Math.max(0.01, parseFloat((prev - 1).toFixed(2))))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModifyPriceValue((prev) => parseFloat((prev + 1).toFixed(2)))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modify Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">改价说明 / 备注</label>
                <input
                  type="text"
                  value={modifyPriceReason}
                  onChange={(e) => setModifyPriceReason(e.target.value)}
                  placeholder="请输入改价原因或备注"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyPriceOrder(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModifyPrice}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>确认改价</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
