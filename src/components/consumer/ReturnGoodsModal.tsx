import React, { useState } from 'react';
import {
  Truck,
  Package,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';

interface ReturnGoodsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderNo: string, trackingNo: string, courierName?: string) => void;
}

export const ReturnGoodsModal: React.FC<ReturnGoodsModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [returnMethod, setReturnMethod] = useState<'express' | 'errand' | 'store'>('express');
  const [courierName, setCourierName] = useState<string>('顺丰速运');
  const [trackingNo, setTrackingNo] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('138****5621');
  const [returnRemark, setReturnRemark] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !order) return null;

  const type = order.afterSale?.type || 'refund';
  const isExchange = type === 'exchange';

  const quickCouriers = ['顺丰速运', '中通快递', '圆通速递', '京东快递', '极兔速递'];

  const handleQuickFill = () => {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const prefix = courierName === '顺丰速运' ? 'SF' : courierName === '京东快递' ? 'JD' : 'YT';
    setTrackingNo(`${prefix}${randomSuffix}`);
    setErrorMsg('');
  };

  const handleSubmit = () => {
    if (returnMethod === 'express') {
      if (!trackingNo.trim()) {
        setErrorMsg('请填写退货物流单号');
        return;
      }
    }
    const finalTracking =
      returnMethod === 'express'
        ? `${courierName}: ${trackingNo.trim()}`
        : returnMethod === 'errand'
        ? '同城跑腿闪送已送回'
        : '买家自送到店退回';

    onConfirm(order.orderNo, finalTracking, courierName);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  {isExchange ? '寄回商品以换货' : '寄回商品'}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">订单号: {order.orderNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto no-scrollbar text-xs">
            {/* Merchant return address hint */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900 text-xs">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>退件接收商家: {order.merchantName}</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                收件地址: {order.fulfillment?.pickupAddress || '江西省南昌市红谷滩区绿茵路88号商超自提点'}
              </p>
              <p className="text-[10px] text-amber-700/80">
                请妥善包装商品及配件，寄出后及时填写物流单号以便商家核验退款。
              </p>
            </div>

            {/* Return Method Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-800">退回方式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'express', label: '快递寄回', desc: '全国快递' },
                  { id: 'errand', label: '同城跑腿', desc: '美团/闪送' },
                  { id: 'store', label: '自送门店', desc: '到店直接还' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setReturnMethod(m.id as any);
                      setErrorMsg('');
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      returnMethod === m.id
                        ? 'border-[#00B578] bg-emerald-50 text-[#00B578] font-black shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs">{m.label}</span>
                    <span className="text-[9px] opacity-70 mt-0.5">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Express Details (if express) */}
            {returnMethod === 'express' && (
              <div className="space-y-3 pt-1">
                {/* Courier selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">选择物流快递</label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickCouriers.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCourierName(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                          courierName === c
                            ? 'bg-[#00B578] text-white border-[#00B578]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking No */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">快递单号 (必填)</label>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-[10px] text-[#00B578] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>模拟生成单号</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => {
                      setTrackingNo(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="请输入退货快递单号（如顺丰/中通单号）..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 font-mono"
                  />
                  {errorMsg && (
                    <p className="text-[11px] text-rose-500 font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {returnMethod === 'errand' && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                <p className="font-bold text-xs">同城跑腿/闪送直达</p>
                <p className="text-[11px] text-blue-700">
                  如使用美团跑腿或闪送，请将骑手联系电话与预计送达时间填写在备注中。
                </p>
              </div>
            )}

            {returnMethod === 'store' && (
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 text-emerald-900 space-y-1">
                <p className="font-bold text-xs">亲自送达门店</p>
                <p className="text-[11px] text-emerald-700">
                  您可以在营业时间内将商品带至门店自提台，向店员出示退货订单号即可。
                </p>
              </div>
            )}

            {/* Contact phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">寄件人联系电话</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="请输入联系电话..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 font-mono"
              />
            </div>

            {/* Note / Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">退件备注 (选填)</label>
              <textarea
                rows={2}
                value={returnRemark}
                onChange={(e) => setReturnRemark(e.target.value)}
                placeholder="如有包装破损、配件缺失等情况可在此说明..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
            >
              稍后退回
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认提交寄出</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
