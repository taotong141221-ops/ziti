import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, RefreshCw, AlertTriangle, Store, Info } from 'lucide-react';
import { Order } from '../../types';

interface AfterSalesModalProps {
  order: Order | null;
  onClose: () => void;
  onSubmitAfterSales: (
    orderNo: string,
    reason: string,
    refundType: string,
    exchangeOptions?: {
      exchangeType?: 'store_exchange';
      exchangeSpec?: string;
      description?: string;
      overdueServiceFee?: number;
      netRefundAmount?: number;
      overdueFeeRate?: number;
      isOverdue?: boolean;
    }
  ) => void;
}

export const AfterSalesModal: React.FC<AfterSalesModalProps> = ({
  order,
  onClose,
  onSubmitAfterSales,
}) => {
  if (!order) return null;

  // Simulate or inherit overdue state
  const [isOverdueState, setIsOverdueState] = useState<boolean>(!!order.isOverduePickup);
  const [aftersaleType, setAftersaleType] = useState<'only_refund' | 'exchange'>('only_refund');
  const [reason, setReason] = useState<string>(
    isOverdueState ? '超过预约自提时间未提货，申请退款' : '选错商品/规格，重新下单'
  );
  const [description, setDescription] = useState<string>('');
  const [exchangeSpec, setExchangeSpec] = useState<string>('到店调换同规格完好现货');

  const feeRate = order.overdueFeeRate || 10;
  const serviceFee = Number(((order.payAmount * feeRate) / 100).toFixed(2));
  const netRefundAmount = isOverdueState
    ? Number(Math.max(0, order.payAmount - serviceFee).toFixed(2))
    : Number(order.payAmount.toFixed(2));

  const refundReasons = isOverdueState
    ? [
        '超过预约自提时间未提货，申请退款',
        '临时有事无法按时到店自提',
        '距离门店较远/行程变更',
        '已重新选购其他商品',
        '其他原因申请退款',
      ]
    : [
        '选错商品/规格，重新下单',
        '计划有变无需到店自提',
        '与商家沟通一致申请退款',
        '自提点距离较远/行程冲突',
        '其他原因协商退款',
      ];

  const exchangeReasons = [
    '到店自提发现选错口味/规格',
    '包装破损申请调换完好现货',
    '同等价值商品到店调换',
    '保质期临近申请换新鲜批次',
  ];

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl p-5 max-h-[90%] flex flex-col shadow-2xl space-y-3.5 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-gray-900">
                {aftersaleType === 'exchange' ? '申请到店换货' : '申请自提退款'}
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200/60">
                到店自提
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              订单号: {order.orderNo} · 预约时段: {order.selectedPickupTime || '今日内'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overdue Status Banner & Fee Rule */}
        {aftersaleType === 'only_refund' && (
          <div>
            {isOverdueState ? (
              <div className="text-[11px] bg-amber-50 text-amber-900 p-3 rounded-2xl border border-amber-300/80 space-y-1">
                <div className="flex items-center space-x-1.5 font-black text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>已过预约自提时间（超时退款）</span>
                </div>
                <p className="leading-snug">
                  您预约的自提时间为【
                  <span className="font-bold">{order.selectedPickupTime || '预约时间'}</span>
                  】。因已超过客户预约时间，商家已完成备货与食材锁定，退款将按约定扣除{' '}
                  <strong className="text-rose-600">{feeRate}% 服务费</strong>。
                </p>
              </div>
            ) : (
              <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2.5 rounded-2xl border border-emerald-200/60 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  当前仍在预约自提时效内，申请退款免收服务费，将全额原路退还 ¥
                  {order.payAmount.toFixed(2)}。
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
          {/* Aftersale Type Switch */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">售后类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAftersaleType('only_refund');
                  setReason(refundReasons[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  aftersaleType === 'only_refund'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-black shadow-2xs'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                申请退款
              </button>
              <button
                type="button"
                onClick={() => {
                  setAftersaleType('exchange');
                  setReason(exchangeReasons[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center flex items-center justify-center space-x-1 ${
                  aftersaleType === 'exchange'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-black shadow-2xs'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>到店调换规格</span>
              </button>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              {aftersaleType === 'exchange' ? '调换原因' : '退款原因'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white"
            >
              {(aftersaleType === 'exchange' ? exchangeReasons : refundReasons).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Refund Breakdown / Exchange input */}
          {aftersaleType === 'only_refund' ? (
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>原订单实付金额:</span>
                <span className="font-mono font-bold text-gray-900">
                  ¥{order.payAmount.toFixed(2)}
                </span>
              </div>

              {isOverdueState && (
                <div className="flex justify-between items-center text-xs text-rose-600">
                  <span>超时未提扣除服务费 ({feeRate}%):</span>
                  <span className="font-mono font-bold">-¥{serviceFee.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-1.5 border-t border-gray-200/80 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900">预计退款到账:</span>
                <span className="text-base font-black text-rose-600 font-mono">
                  ¥{netRefundAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">换货目标要求</label>
              <input
                type="text"
                value={exchangeSpec}
                onChange={(e) => setExchangeSpec(e.target.value)}
                placeholder="调换同规格完好现货 / 更换指定口味"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">补充说明 (选填)</label>
            <textarea
              rows={2}
              placeholder="请填写具体原因或留言给门店店长..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          {/* Quick toggle for testing/demonstration */}
          <div className="p-2.5 rounded-xl bg-gray-100/70 border border-gray-200/60 flex items-center justify-between text-[11px] text-gray-600">
            <span>演示切换当前订单自提时效状态:</span>
            <button
              type="button"
              onClick={() => {
                const next = !isOverdueState;
                setIsOverdueState(next);
                setReason(next ? '超过预约自提时间未提货，申请退款' : '选错商品/规格，重新下单');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isOverdueState
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-emerald-600 text-white shadow-2xs'
              }`}
            >
              {isOverdueState ? '切换为：预约时效内' : '切换为：已超时(扣10%)'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmitAfterSales(order.orderNo, reason, aftersaleType, {
                exchangeType: 'store_exchange',
                exchangeSpec: aftersaleType === 'exchange' ? exchangeSpec : undefined,
                description,
                overdueServiceFee: isOverdueState ? serviceFee : 0,
                netRefundAmount,
                overdueFeeRate: feeRate,
                isOverdue: isOverdueState,
              });
              onClose();
            }}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
          >
            确认提交申请
          </button>
        </div>
      </div>
    </div>
  );
};
