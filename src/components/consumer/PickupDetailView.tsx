import React, { useState } from 'react';
import {
  Store,
  Phone,
  QrCode,
  CheckCircle,
  Home,
  Clock,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Package,
  Calendar,
  AlertTriangle,
  Info,
  Navigation,
  Sparkles,
  Gift,
} from 'lucide-react';
import { Order } from '../../types';
import { ReturnGoodsModal } from './ReturnGoodsModal';

interface PickupDetailViewProps {
  order: Order;
  onPayOrder?: (order: Order) => void;
  onDirectRefund?: (orderNo: string) => void;
  onApplyAfterSale: (order: Order) => void;
  onCancelAfterSale?: (orderNo: string) => void;
  onConfirmCustomerShipped?: (orderNo: string, trackingNo?: string, courierName?: string) => void;
  onGoHome: () => void;
}

const formatPickupTimePoint = (time?: string): string => {
  if (!time) return '17:15';
  const trimmed = time.trim();
  const timePart = trimmed.includes(' ') ? trimmed.split(' ')[1] : trimmed;
  const sub = timePart.split(':');
  if (sub.length >= 2) {
    return `${sub[0].padStart(2, '0')}:${sub[1].padStart(2, '0')}`;
  }
  return timePart;
};

export const PickupDetailView: React.FC<PickupDetailViewProps> = ({
  order,
  onPayOrder,
  onDirectRefund,
  onApplyAfterSale,
  onCancelAfterSale,
  onConfirmCustomerShipped,
  onGoHome,
}) => {
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [navToast, setNavToast] = useState<string | null>(null);

  const handleStartNav = () => {
    setNavToast(`已开启地图导航至: ${order.merchantAddress}`);
    setTimeout(() => setNavToast(null), 2500);
  };

  const isOverdue = !!order.isOverduePickup;
  const feeRate = order.overdueFeeRate || 10;
  const serviceFee = Number(((order.payAmount * feeRate) / 100).toFixed(2));
  const netRefund = Number(Math.max(0, order.payAmount - serviceFee).toFixed(2));

  const getStatusDisplay = () => {
    switch (order.orderStatus) {
      case 'pending_pay':
        return {
          title: '等待支付',
          desc: '请在15分钟内完成支付',
          color: 'bg-rose-500 text-white',
          badge: '待付款',
        };
      case 'pending_accept':
        return {
          title: '等待商家接单',
          desc: '商家将在5分钟内接单并开始备货',
          color: 'bg-amber-500 text-white',
          badge: '待接单',
        };
      case 'picking':
        return {
          title: '商家正在拣货备货中',
          desc: '现货保温包装中，请按预约时间到店自提',
          color: 'bg-blue-500 text-white',
          badge: '拣货中',
        };
      case 'ready_pickup':
        return isOverdue
          ? {
              title: '已过自提时间（超时待提）',
              desc: '商品已在门店保温待取；如申请退款将按10%扣除服务费',
              color: 'bg-amber-600 text-white',
              badge: '已超时',
            }
          : {
              title: '商品已备好，请到店自提',
              desc: '请出示提货码给店员完成核销',
              color: 'bg-emerald-600 text-white',
              badge: '待自提',
            };
      case 'finished':
        return {
          title: '订单已完成核销',
          desc: '已成功自提，消费积分已发放到您的福利账户',
          color: 'bg-emerald-700 text-white',
          badge: '已完成',
        };
      case 'refunded':
        return {
          title: '订单已退款',
          desc: isOverdue
            ? `已扣除${feeRate}%备货服务费(¥${(order.overdueServiceFee || serviceFee).toFixed(2)})，实退¥${(order.afterSale?.refundAmount || netRefund).toFixed(2)}`
            : `退款金额 ¥${order.payAmount.toFixed(2)} 已原路退回`,
          color: 'bg-gray-700 text-white',
          badge: '已退款',
        };
      case 'aftersale': {
        const afStatus = order.afterSale?.status;
        if (afStatus === 'approved') {
          return {
            title: '商家已同意售后申请',
            desc: isOverdue
              ? `超时退款审核通过，已扣除${feeRate}%服务费，实退¥${(order.afterSale?.refundAmount || netRefund).toFixed(2)}`
              : '商家已同意退款，款项已原路退回',
            color: 'bg-emerald-600 text-white',
            badge: '售后完成',
          };
        }
        if (afStatus === 'rejected') {
          return {
            title: '售后申请已被商家驳回',
            desc: order.afterSale?.auditReason || '商家已驳回您的申请，您可修改后重新申请',
            color: 'bg-rose-600 text-white',
            badge: '已驳回',
          };
        }
        return {
          title: '售后处理中·待审核',
          desc: `申请原因: ${order.aftersaleReason || order.afterSale?.reason || '退款申请中'}`,
          color: 'bg-purple-600 text-white',
          badge: '待审核',
        };
      }
      default:
        return {
          title: '订单进行中',
          desc: '商品状态更新中',
          color: 'bg-gray-800 text-white',
          badge: order.orderStatus,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const pickupCode = order.fulfillment?.pickupCode || '894216';

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar pb-24 space-y-3">
      {/* Top Status Banner */}
      <div className={`${statusInfo.color} px-5 pt-4 pb-6 transition-colors shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
            到店自提 · {statusInfo.badge}
          </span>
        </div>
        <h1 className="text-lg font-black mt-2 tracking-tight">{statusInfo.title}</h1>
        <p className="text-xs text-white/90 mt-0.5">{statusInfo.desc}</p>
      </div>

      {/* Main Verification Card (Prominent Code & QR Token) */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md text-center space-y-4">
          {/* Overdue Warning Notice if overdue */}
          {isOverdue && order.orderStatus === 'ready_pickup' && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3 text-left space-y-1 text-xs text-amber-900">
              <div className="flex items-center space-x-1.5 font-black text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>已超过客户预约自提时间</span>
              </div>
              <p className="text-[11px] leading-snug">
                您预约的提货时间为【
                <span className="font-bold">{formatPickupTimePoint(order.selectedPickupTime)}</span>
                】。商家已依约完成备货，现若申请退款将收取 <strong>{feeRate}%</strong> 服务费（¥
                {serviceFee.toFixed(2)}），实退 ¥{netRefund.toFixed(2)}。
              </p>
            </div>
          )}

          {/* 预约自提时间 (唯一保留，放在核销码上面，已退款状态不展示) */}
          {order.orderStatus !== 'refunded' && (
            <div className="bg-[#F8FAF9] border border-gray-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">自提时间:</span>
              </div>
              <span className="font-black text-emerald-700 font-mono text-sm">
                {formatPickupTimePoint(order.selectedPickupTime || order.createTime)}
              </span>
            </div>
          )}

          {/* Pickup Code Display */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl py-3.5 px-4 flex flex-col items-center justify-center">
            <span className="text-[11px] text-gray-500 font-medium mb-1">到店提货核销码</span>
            <span className="text-3xl font-black text-emerald-700 tracking-widest font-mono">
              {pickupCode.slice(0, 3)} {pickupCode.slice(3)}
            </span>
          </div>

          {/* Simulated Dynamic QR Code */}
          <div className="w-40 h-40 mx-auto bg-gray-50 p-2.5 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center relative">
            <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-white rounded-xl">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xs ${
                    i % 2 === 0 || i % 5 === 0 || i === 12
                      ? 'bg-gray-900'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            {order.orderStatus === 'finished' && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-emerald-600 font-bold text-xs">
                <CheckCircle className="w-8 h-8 mb-1" />
                <span>已完成核销</span>
              </div>
            )}
            {order.orderStatus === 'refunded' && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-gray-500 font-bold text-xs">
                <AlertCircle className="w-8 h-8 mb-1 text-gray-400" />
                <span>订单已退款</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {navToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center space-x-1.5 animate-bounce">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>{navToast}</span>
        </div>
      )}

      {/* Store Location Card with Navigation Icon */}
      <div className="px-4 space-y-2.5">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 min-w-0 flex-1 pr-2">
              <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-gray-900">{order.merchantName}</h3>
                <div className="mt-1 flex items-center">
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
                <div className="flex items-center space-x-1.5 mt-1">
                  <p className="text-[11px] text-gray-600 leading-snug truncate">
                    {order.merchantAddress}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  联系电话: {order.merchantPhone}
                </p>
              </div>
            </div>

            {/* Navigation Action Button */}
            <button
              type="button"
              onClick={handleStartNav}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 transition border border-emerald-200/80 cursor-pointer shadow-2xs"
              title="导航到店"
              id="btn-navigate-to-store"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              <span>导航</span>
            </button>
          </div>
        </div>
      </div>

      {/* After-Sales Info (if exists) */}
      {order.afterSale && (
        <div className="px-4">
          <div className="bg-purple-50/80 rounded-2xl p-3.5 border border-purple-200/70 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-black text-purple-900">
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>售后退款详情</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                  order.afterSale.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 border-amber-300/80'
                    : order.afterSale.status === 'approved' || order.afterSale.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300/80'
                    : 'bg-rose-100 text-rose-800 border-rose-300/80'
                }`}
              >
                {order.afterSale.status === 'pending'
                  ? '待审核'
                  : order.afterSale.status === 'approved' || order.afterSale.status === 'completed'
                  ? '退款完成'
                  : '已驳回'}
              </span>
            </div>

            {/* Overdue fee deduction breakdown in after-sale banner */}
            {order.isOverduePickup && (
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <div className="font-bold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>超时自提退款扣除明细</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>订单实付金额:</span>
                  <span>¥{order.payAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>扣除备货服务费 ({feeRate}%):</span>
                  <span>-¥{(order.overdueServiceFee || serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-gray-100">
                  <span>实际退款金额:</span>
                  <span>¥{(order.afterSale.refundAmount || netRefund).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="text-[11px] text-purple-900/90 space-y-1">
              <div>
                <span className="text-purple-600 font-bold">申请原因: </span>
                <span>{order.afterSale.reason}</span>
              </div>
              {order.afterSale.auditReason && (
                <div className="text-[10px] bg-white/90 p-2 rounded-xl border border-purple-100 text-purple-900 leading-relaxed">
                  <span className="font-bold text-gray-700">审核回复: </span>
                  <span>{order.afterSale.auditReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ordered Products List (Exact match Image 3) */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="text-xs font-black text-gray-900 pb-2 border-b border-gray-100">
            商品清单
          </div>
          <div className="divide-y divide-gray-50 space-y-2">
            {order.items.map((item) => (
              <div key={item.skuId} className="flex space-x-3 pt-2 first:pt-0">
                <img
                  src={item.imageSnapshot}
                  alt={item.titleSnapshot}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0 border border-gray-100"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-900 truncate">{item.titleSnapshot}</div>
                  <div className="text-[10px] text-gray-400">{item.specSnapshot}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-gray-900 font-mono">
                      ¥{item.priceSnapshot.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between items-center text-gray-600">
              <span>订单编号</span>
              <span className="font-mono text-gray-800 select-all">{order.orderNo}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span>下单时间</span>
              <span className="font-mono text-gray-800">{order.createTime}</span>
            </div>

            {order.payTime && (
              <div className="flex justify-between items-center text-gray-600">
                <span>付款时间</span>
                <span className="font-mono text-gray-800">{order.payTime}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-gray-600 pt-1">
              <span>商品总额</span>
              <span className="font-mono text-gray-900 font-bold">¥{order.goodsAmount.toFixed(2)}</span>
            </div>

            {order.pointDeductAmount > 0 ? (
              <div className="flex justify-between items-center text-rose-600">
                <span>积分抵扣</span>
                <span className="font-mono font-bold">-¥{order.pointDeductAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-gray-400">
                <span>积分抵扣</span>
                <span className="font-mono">¥0.00</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-900 text-sm">实付金额</span>
              <span className="text-base font-black text-rose-600 font-mono">
                ¥{order.payAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 flex space-x-2">
        <button
          onClick={onGoHome}
          className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs cursor-pointer shrink-0"
          id="btn-pickup-home"
        >
          <Home className="w-3.5 h-3.5 text-gray-600" />
          <span>返回首页</span>
        </button>

        <a
          href={`tel:${order.merchantPhone}`}
          className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition text-center shrink-0"
          id="btn-contact-merchant"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>联系门店</span>
        </a>

        {/* 待付款 */}
        {order.orderStatus === 'pending_pay' && (
          <>
            {onDirectRefund && (
              <button
                type="button"
                onClick={() => onDirectRefund(order.orderNo)}
                className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                id={`btn-detail-cancel-pending-pay-${order.orderNo}`}
              >
                取消订单
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onPayOrder) onPayOrder(order);
              }}
              className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1"
              id={`btn-detail-pay-${order.orderNo}`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>立即付款</span>
            </button>
          </>
        )}

        {/* 待备货: 直接退款 */}
        {['pending_accept', 'picking'].includes(order.orderStatus) && onDirectRefund && (
          <button
            type="button"
            onClick={() => onDirectRefund(order.orderNo)}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
            id={`btn-detail-refund-preparing-${order.orderNo}`}
          >
            申请退款 (全额)
          </button>
        )}

        {/* 待自提: 申请售后 */}
        {order.orderStatus === 'ready_pickup' && (
          <button
            type="button"
            onClick={() => onApplyAfterSale(order)}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
            id={`btn-detail-apply-aftersale-pickup-${order.orderNo}`}
          >
            申请售后
          </button>
        )}

        {/* 售后中 */}
        {order.orderStatus === 'aftersale' && onCancelAfterSale && order.afterSale?.status === 'pending' && (
          <button
            type="button"
            onClick={() => onCancelAfterSale(order.orderNo)}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
            id={`btn-detail-cancel-aftersale-${order.orderNo}`}
          >
            撤销售后申请
          </button>
        )}
      </div>

      {/* Return Goods Modal */}
      <ReturnGoodsModal
        order={order}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={(orderNo, trackingNo, courierName) => {
          if (onConfirmCustomerShipped) {
            onConfirmCustomerShipped(orderNo, trackingNo, courierName);
          }
        }}
      />
    </div>
  );
};
