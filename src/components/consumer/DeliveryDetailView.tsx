import React, { useState } from 'react';
import { Truck, MapPin, Phone, RefreshCw, Home, Package, CreditCard, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { ReturnGoodsModal } from './ReturnGoodsModal';

interface DeliveryDetailViewProps {
  order: Order;
  onPayOrder?: (order: Order) => void;
  onDirectRefund?: (orderNo: string) => void;
  onConfirmReceived: (orderNo: string) => void;
  onApplyAfterSale: (order: Order) => void;
  onCancelAfterSale?: (orderNo: string) => void;
  onConfirmCustomerShipped?: (orderNo: string, trackingNo?: string, courierName?: string) => void;
  onGoHome: () => void;
}

export const DeliveryDetailView: React.FC<DeliveryDetailViewProps> = ({
  order,
  onPayOrder,
  onDirectRefund,
  onConfirmReceived,
  onApplyAfterSale,
  onCancelAfterSale,
  onConfirmCustomerShipped,
  onGoHome,
}) => {
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const getDeliveryStatusMeta = () => {
    if (order.afterSale) {
      if (order.afterSale.type === 'exchange') {
        return {
          title: order.afterSale.status === 'approved' ? '商家已同意换货' : '售后换货处理中',
          desc: order.afterSale.status === 'approved' ? '骑手正在为您上门取旧送新' : `换货原因: ${order.afterSale.reason}`,
          timeEstimate: '售后处理中',
          step: 3,
        };
      }
    }

    switch (order.orderStatus) {
      case 'pending_accept':
        return {
          title: '等待商家接单',
          desc: '商家接单后将立即打包',
          timeEstimate: '预计 35 分钟内送达',
          step: 1,
        };
      case 'picking':
        return {
          title: '商家正在拣货打包',
          desc: '30分钟内完成打包并呼叫骑手',
          timeEstimate: '预计 30 分钟内送达',
          step: 2,
        };
      case 'ready_delivery':
        return {
          title: '已呼叫骑手，等待取货',
          desc: '顺丰同城/达达骑手已接单，正在赶往门店',
          timeEstimate: '预计 20 分钟内送达',
          step: 3,
        };
      case 'delivering':
        return {
          title: '骑手正在全力配送中',
          desc: '距离您 650米，请保持手机畅通',
          timeEstimate: '预计 8 分钟内送达',
          step: 4,
        };
      case 'delivered':
        return {
          title: '骑手已送达',
          desc: '请及时取货，48小时后将自动确认收货',
          timeEstimate: '已完成投递',
          step: 5,
        };
      case 'finished':
        return {
          title: '订单已确认完成',
          desc: '感谢您的支持，消费积分已计入账户',
          timeEstimate: '交易圆满完成',
          step: 6,
        };
      case 'aftersale': {
        const afStatus = order.afterSale?.status;
        if (afStatus === 'approved' || afStatus === 'waiting_customer_ship') {
          return {
            title: '商家已同意退货·待寄回',
            desc: '商家已审核通过，请尽快打包并寄回商品填写单号',
            timeEstimate: '请在7天内寄回',
            step: 3,
          };
        }
        if (afStatus === 'customer_shipped') {
          return {
            title: '商品已寄出·待商家验货',
            desc: `物流单号: ${order.afterSale?.returnTrackingNo || '已寄出'}，商家签收后将退款`,
            timeEstimate: '预计1-3天验货入账',
            step: 4,
          };
        }
        if (afStatus === 'rejected') {
          return {
            title: '售后申请已被商家驳回',
            desc: order.afterSale?.auditReason || '商家已驳回您的申请，您可修改后重新申请或联系门店',
            timeEstimate: '可重新发起申请',
            step: 3,
          };
        }
        return {
          title: '售后处理中·待审核',
          desc: `申请原因: ${order.aftersaleReason || order.afterSale?.reason || '退款申请中'}`,
          timeEstimate: '商家将在48小时内审核',
          step: 3,
        };
      }
      case 'refunded':
        return {
          title: '退款已原路退回',
          desc: `款项 ¥${order.payAmount.toFixed(2)} 已退回原支付账户`,
          timeEstimate: '退款已入账',
          step: 6,
        };
      default:
        return {
          title: '订单处理中',
          desc: '骑手调度中',
          timeEstimate: '预计 30 分钟',
          step: 1,
        };
    }
  };

  const statusMeta = getDeliveryStatusMeta();
  const courier = order.fulfillment;

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar pb-24 space-y-3">
      {/* Dynamic Simulated Map / Radar Canvas */}
      <div className="h-44 bg-gradient-to-br from-emerald-100/70 via-teal-50/50 to-blue-50 relative overflow-hidden border-b border-emerald-100 flex items-center justify-center">
        {/* Subtle grid pattern resembling streets */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(#00B578 1px, transparent 1px), radial-gradient(#00B578 1px, #F5F7FA 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        {/* Street Line Vector Simulation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-400/40 stroke-2 fill-none">
          <path d="M -20,60 Q 100,40 180,90 T 360,70 T 420,120" />
          <path d="M 50,-10 Q 120,80 200,80 T 380,160" />
          <path
            d="M 60,110 L 190,80 L 320,60"
            strokeDasharray="4 4"
            className="stroke-emerald-600 stroke-[2.5]"
          />
        </svg>

        {/* Merchant Location Pin */}
        <div className="absolute left-8 top-16 flex flex-col items-center">
          <div className="bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1">
            商家门店
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <span className="text-xs font-black">商</span>
          </div>
        </div>

        {/* Customer Location Pin */}
        <div className="absolute right-12 top-8 flex flex-col items-center">
          <div className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1">
            收货地址
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Rider Pin on the Route */}
        {order.orderStatus === 'delivering' && (
          <div className="absolute left-[52%] top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce duration-1000">
            <div className="bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>骑手配送中 (距你650m)</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FF6B00] border-2 border-white shadow-xl flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Top Floating Mini Status Pill */}
        <div className="absolute top-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-md flex items-center justify-between border border-gray-100">
          <div>
            <span className="text-xs font-black text-gray-900">{statusMeta.title}</span>
            <span className="text-[10px] text-emerald-700 ml-2 font-bold">{statusMeta.timeEstimate}</span>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
            {courier.provider || '顺丰同城'}
          </span>
        </div>
      </div>

      {/* Courier Info Card */}
      <div className="px-4 -mt-2">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-inner">
                {courier.courierName ? courier.courierName.slice(0, 1) : '骑'}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-gray-900">
                    {courier.courierName || '同城专送骑手 (已接单)'}
                  </span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                    实名认证
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {courier.provider || '顺丰同城急送'} · 准时宝已保障
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${courier.courierPhone || '13800000000'}`}
                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition"
                title="拨打骑手电话"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div className="pt-2 border-t border-gray-50 flex items-start space-x-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-gray-900 font-bold">
                {courier.receiverAddress || '红谷滩区绿茵路绿地中央广场A座 1206室'}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">
                收件人: {courier.receiverName || 'Ella'} ({courier.receiverPhone || '13725655698'})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 售后/换货状态卡片展示 (如果存在) */}
      {order.afterSale && (
        <div className="px-4">
          <div className="bg-purple-50/80 rounded-2xl p-3.5 border border-purple-200/70 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-black text-purple-900">
                {order.afterSale.type === 'exchange' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                    <span>售后换货申请</span>
                  </>
                ) : order.afterSale.type === 'return' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>售后退货退款申请</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>售后退款申请</span>
                  </>
                )}
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                  order.afterSale.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 border-amber-300/80'
                    : order.afterSale.status === 'approved' ||
                      order.afterSale.status === 'waiting_customer_ship'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300/80'
                    : order.afterSale.status === 'customer_shipped'
                    ? 'bg-purple-200 text-purple-800 border-purple-300/80'
                    : order.afterSale.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800 border-rose-300/80'
                    : 'bg-gray-100 text-gray-700 border-gray-300/80'
                }`}
              >
                {order.afterSale.status === 'pending'
                  ? '待审核'
                  : order.afterSale.status === 'approved' ||
                    order.afterSale.status === 'waiting_customer_ship'
                  ? '已同意·待寄回'
                  : order.afterSale.status === 'customer_shipped'
                  ? '已寄出·待验货'
                  : order.afterSale.status === 'rejected'
                  ? '已驳回'
                  : '已完成'}
              </span>
            </div>

            {order.afterSale.type === 'exchange' && (
              <div className="text-[11px] text-purple-700 bg-white/80 p-2 rounded-xl border border-purple-100 space-y-0.5">
                <div>调换模式: {order.afterSale.exchangeType === 'courier_exchange' ? '骑手上门换新' : '到店自提点调换'}</div>
                {order.afterSale.exchangeSpec && <div>目标规格: {order.afterSale.exchangeSpec}</div>}
              </div>
            )}

            <div className="text-[11px] text-purple-900/90 space-y-1">
              <div>
                <span className="text-purple-600 font-bold">原因说明: </span>
                <span>{order.afterSale.reason}</span>
              </div>
              {order.afterSale.description && (
                <div className="text-purple-700/80 text-[10px]">
                  <span className="font-bold">详细补充: </span>
                  <span>{order.afterSale.description}</span>
                </div>
              )}
            </div>

            {/* Merchant Audit Notes */}
            {order.afterSale.auditReason && (
              <div className="text-[10px] bg-white/90 p-2 rounded-xl border border-purple-100 text-purple-900 leading-relaxed">
                <span className="font-bold text-gray-700">商家答复: </span>
                <span>{order.afterSale.auditReason}</span>
              </div>
            )}

            {/* Customer Return Shipping Tracking info */}
            {order.afterSale.returnTrackingNo && (
              <div className="text-[10px] bg-white/90 p-2 rounded-xl border border-purple-100 text-purple-900 flex items-center justify-between">
                <span className="font-bold text-gray-700">退货物流: {order.afterSale.returnCourier || '快递物流'}</span>
                <span className="font-mono text-purple-800 font-black">{order.afterSale.returnTrackingNo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items List */}
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
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-900 truncate">{item.titleSnapshot}</div>
                  <div className="text-[10px] text-gray-400">{item.specSnapshot}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-gray-900">¥{item.priceSnapshot.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fee Table (订单号放在商品总额上面) */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            {/* 订单编号放在商品总额上面 */}
            <div className="flex justify-between pb-1 text-gray-500 border-b border-gray-50">
              <span>订单编号</span>
              <span className="font-mono text-gray-700 select-all">{order.orderNo}</span>
            </div>

            <div className="flex justify-between items-center text-gray-500">
              <span>下单时间</span>
              <span className="font-mono text-gray-700">{order.createTime}</span>
            </div>

            {order.payTime && (
              <div className="flex justify-between items-center text-gray-500">
                <span>付款时间</span>
                <span className="font-mono text-gray-700">{order.payTime}</span>
              </div>
            )}

            {(order.fulfillment?.deliveredTime || order.deliveredTime || (order.orderStatus === 'delivered' && order.finishTime)) && (
              <div className="flex justify-between items-center text-sky-700 font-medium">
                <span>送达时间</span>
                <span className="font-mono">{order.fulfillment?.deliveredTime || order.deliveredTime || order.finishTime || '2026-08-26 16:15:00'}</span>
              </div>
            )}

            {(order.fulfillment?.receiveTime || order.receiveTime || (order.orderStatus === 'finished' && order.finishTime)) && (
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span>收货时间</span>
                <span className="font-mono">{order.fulfillment?.receiveTime || order.receiveTime || order.finishTime || '2026-08-26 16:30:00'}</span>
              </div>
            )}

            {order.afterSale?.applyTime && (
              <div className="flex justify-between items-center text-rose-600 font-medium">
                <span>申请售后时间</span>
                <span className="font-mono">{order.afterSale.applyTime}</span>
              </div>
            )}

            {(order.afterSale?.finishTime || (order.orderStatus === 'refunded' && order.finishTime)) && (
              <div className="flex justify-between items-center text-purple-700 font-medium">
                <span>完成售后时间</span>
                <span className="font-mono">{order.afterSale?.finishTime || order.finishTime}</span>
              </div>
            )}

            <div className="flex justify-between pt-1 border-t border-gray-50">
              <span>商品总额</span>
              <span>¥{order.goodsAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>社区配送费</span>
              <span className="font-bold text-gray-900">¥{order.deliveryFee.toFixed(2)}</span>
            </div>
            {((order.discountAmount ?? 0) > 0 || (order.couponDiscountAmount ?? 0) > 0) && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>优惠抵扣金额</span>
                <span>-¥{(order.discountAmount ?? order.couponDiscountAmount ?? 0).toFixed(2)}</span>
              </div>
            )}
            {order.pointDeductAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>积分/消费金抵扣</span>
                <span>-¥{order.pointDeductAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-100 font-bold text-gray-900 text-sm">
              <span>实付总额</span>
              <span className="text-rose-600 font-black">¥{order.payAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar: 返回首页 + 对应状态操作按钮 (与订单列表严格保持一致) */}
      <div className="px-4 flex space-x-2">
        <button
          onClick={onGoHome}
          className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition shadow-2xs cursor-pointer shrink-0"
          id="btn-delivery-home"
        >
          <Home className="w-3.5 h-3.5 text-gray-600" />
          <span>返回首页</span>
        </button>

        {/* 1. 待付款: 取消订单 + 立即付款 */}
        {order.orderStatus === 'pending_pay' && (
          <>
            {onDirectRefund && (
              <button
                type="button"
                onClick={() => onDirectRefund(order.orderNo)}
                className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                id={`btn-delivery-cancel-pending-pay-${order.orderNo}`}
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
              id={`btn-delivery-pay-${order.orderNo}`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>立即付款</span>
            </button>
          </>
        )}

        {/* 2. 待备货 (待接单 / 拣货中): 退款(免审核) */}
        {['pending_accept', 'picking'].includes(order.orderStatus) && onDirectRefund && (
          <button
            type="button"
            onClick={() => onDirectRefund(order.orderNo)}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
            id={`btn-delivery-refund-preparing-${order.orderNo}`}
          >
            退款
          </button>
        )}

        {/* 3. 待收货 / 配送中 (待取货 或 配送中): 退款退货(需审核) */}
        {(order.orderStatus === 'ready_delivery' || order.orderStatus === 'delivering') && (
          <button
            type="button"
            onClick={() => onApplyAfterSale(order)}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
            id={`btn-delivery-apply-aftersale-delivering-${order.orderNo}`}
          >
            退款退货
          </button>
        )}

        {/* 4. 待收货 (骑手已送达): 退款退货(需审核) + 确认收货 */}
        {order.orderStatus === 'delivered' && (
          <>
            <button
              type="button"
              onClick={() => onApplyAfterSale(order)}
              className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
              id={`btn-delivery-apply-aftersale-delivered-${order.orderNo}`}
            >
              退款退货
            </button>
            <button
              type="button"
              onClick={() => onConfirmReceived(order.orderNo)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1"
              id={`btn-delivery-confirm-received-${order.orderNo}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认收货</span>
            </button>
          </>
        )}

        {/* 5. 已完成: 无退款退货按钮 */}

        {/* 6. 售后中状态 */}
        {order.orderStatus === 'aftersale' && (
          <>
            {(order.afterSale?.status === 'waiting_customer_ship' ||
              order.afterSale?.status === 'approved') && (
              <button
                type="button"
                onClick={() => setShowReturnModal(true)}
                className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1"
                id={`btn-delivery-return-goods-${order.orderNo}`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>寄回商品</span>
              </button>
            )}

            {order.afterSale?.status === 'customer_shipped' && (
              <div className="flex-1 py-2.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 flex items-center justify-center space-x-1">
                <Package className="w-3.5 h-3.5 text-purple-600" />
                <span>已寄出待验货</span>
              </div>
            )}

            {order.afterSale?.status === 'rejected' && (
              <button
                type="button"
                onClick={() => onApplyAfterSale(order)}
                className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition cursor-pointer flex items-center justify-center space-x-1"
                id={`btn-delivery-reapply-aftersale-${order.orderNo}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重新申请</span>
              </button>
            )}

            {onCancelAfterSale && order.afterSale?.status !== 'completed' && (
              <button
                type="button"
                onClick={() => onCancelAfterSale(order.orderNo)}
                className="px-3 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl cursor-pointer"
                id={`btn-delivery-cancel-aftersale-${order.orderNo}`}
              >
                取消申请
              </button>
            )}
          </>
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
