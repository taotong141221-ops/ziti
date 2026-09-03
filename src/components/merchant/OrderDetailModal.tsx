import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  User,
  Phone,
  ShoppingBag,
  Printer,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MerchantOrderItem, formatPickupTimePoint } from './MerchantOrdersView';

interface OrderDetailModalProps {
  order: MerchantOrderItem | null;
  onClose: () => void;
  onPrintReceipt: (order: MerchantOrderItem) => void;
  onVerifyPickup: (order: MerchantOrderItem) => void;
  onMarkReady?: (order: MerchantOrderItem) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onPrintReceipt,
  onVerifyPickup,
  onMarkReady,
}) => {
  const [copiedNo, setCopiedNo] = useState(false);

  if (!order) return null;

  const handleCopyOrderNo = (no: string) => {
    navigator.clipboard.writeText(no);
    setCopiedNo(true);
    setTimeout(() => setCopiedNo(false), 2000);
  };

  const renderStatusBadge = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
            <FileText className="w-4 h-4 text-[#00B578]" />
            <span>订单详情</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Header Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500">当前订单状态</div>
            <div className="text-base font-black text-emerald-900 mt-0.5">
              {order.statusText}
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 flex items-center space-x-1 font-medium">
              <ShoppingBag className="w-3 h-3" />
              <span>履约方式: {order.channel === 'offline' ? '线下就餐消费' : '到店自提 (线上预定)'}</span>
            </div>
          </div>
          <div>{renderStatusBadge()}</div>
        </div>

        {/* Order Number & Timing Meta Section */}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">订单编号:</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold text-gray-900">
                {order.orderNo}
              </span>
              <button
                type="button"
                onClick={() => handleCopyOrderNo(order.orderNo)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded transition cursor-pointer"
                title="复制单号"
              >
                {copiedNo ? (
                  <Check className="w-3 h-3 text-[#00B578]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">下单时间:</span>
            <span className="font-mono text-gray-700">{order.time}</span>
          </div>

          {/* 客户自提时间 (仅线上订单展示，线下没有自提信息) */}
          {order.channel !== 'offline' && (order.pickupTime || order.time) && (
            <div className="flex items-center justify-between text-emerald-800 font-medium">
              <span className="text-emerald-700 font-bold">客户自提时间:</span>
              <span className="font-mono font-bold">
                {formatPickupTimePoint(order.pickupTime || order.time)}
              </span>
            </div>
          )}

          {order.payTime && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">付款时间:</span>
              <span className="font-mono text-gray-700">{order.payTime}</span>
            </div>
          )}

          {order.channel !== 'offline' && (order.verifiedTime || order.pickupStatus === 'completed') && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">核销提货时间:</span>
              <span className="font-mono font-bold text-emerald-800">
                {order.verifiedTime || '2026-08-27 20:15:22'}
              </span>
            </div>
          )}

          {order.isRefunded && (
            <>
              <div className="flex items-center justify-between text-rose-600">
                <span className="font-medium">申请退款时间:</span>
                <span className="font-mono">{order.time}</span>
              </div>
              <div className="flex items-center justify-between text-purple-600">
                <span className="font-medium">完成退款时间:</span>
                <span className="font-mono font-bold">{order.refundTime || '2026-08-27 20:45:10'}</span>
              </div>
            </>
          )}

          {order.channel !== 'offline' && order.pickupCode && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
              <span className="text-emerald-700 font-bold">自提核销码:</span>
              <span className="font-mono font-black text-sm text-[#00B578] tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                {order.pickupCode}
              </span>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="space-y-1.5">
          <div className="text-xs font-black text-gray-800 flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-[#00B578]" />
            <span>顾客信息</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 space-y-1 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-900">{order.customerName}</span>
              <span className="font-mono text-gray-600 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{order.customerPhone || '138****5621'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Goods & Products Section (购买的商品明细 - 1:1 with Image 1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-gray-800">
            <div className="flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#00B578]" />
              <span>购买的商品明细</span>
            </div>
            <span className="text-[11px] text-gray-400 font-normal">
              共 {order.items?.reduce((s, i) => s + i.quantity, 0) || 1} 件
            </span>
          </div>

          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100"
              >
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-gray-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">
                    规格: {item.spec}
                  </div>
                  <div className="flex items-baseline justify-between mt-1 text-xs">
                    <span className="text-gray-500 text-[11px]">
                      ¥{item.price.toFixed(2)} × {item.quantity}
                    </span>
                    <span className="font-black text-gray-900">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Breakdown (订单金额、让利优惠、已抵扣金额、实付金额 - 1:1 with Image 1) */}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>订单商品总额</span>
            <span className="font-bold text-gray-900">
              ¥{order.orderAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>让利优惠 (PV)</span>
            <span className="font-bold">
              -{order.rebateDiscount.toFixed(2)} PV
            </span>
          </div>
          <div className="flex justify-between text-amber-700">
            <span>通宝/积分已抵扣</span>
            <span className="font-bold">
              -¥{order.deductedAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-gray-900">
            <span className="font-bold">顾客实付金额</span>
            <span className="text-base font-black text-[#00B578] font-sans">
              ¥{order.payAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPrintReceipt(order)}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>打印小票</span>
          </button>

          {!order.isRefunded && (
            <>
              {order.channel !== 'offline' && order.pickupStatus !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onVerifyPickup(order);
                  }}
                  className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>核销自提</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition cursor-pointer"
                >
                  确定
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
