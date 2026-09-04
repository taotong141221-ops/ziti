import React, { useState } from 'react';
import { X, CheckCircle2, KeyRound, AlertCircle, ShoppingBag, Phone, ScanLine, PackageCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { MerchantOrderItem, formatPickupTimePoint } from './MerchantOrdersView';

interface PickupVerifyModalProps {
  order: MerchantOrderItem | null;
  onClose: () => void;
  onConfirmVerify: (order: MerchantOrderItem, code: string) => void;
}

export const PickupVerifyModal: React.FC<PickupVerifyModalProps> = ({
  order,
  onClose,
  onConfirmVerify,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!order) return null;

  const totalQuantity = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;

  const handleVerify = () => {
    const trimmed = inputCode.trim();
    if (!trimmed) {
      setErrorMsg('请输入6位提货核销码');
      return;
    }
    // Check code match (or accept any matching pickupCode if provided)
    if (order.pickupCode && trimmed !== order.pickupCode) {
      setErrorMsg(`提货码错误，请核对顾客出示的提货码（提示：${order.pickupCode}）`);
      return;
    }
    setErrorMsg(null);
    onConfirmVerify(order, trimmed);
  };

  const handleQuickFill = () => {
    if (order.pickupCode) {
      setInputCode(order.pickupCode);
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3.5 my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-gray-900 font-black text-sm">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <span>确认自提 · 提货码核销</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Info Summary Box */}
        <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-100/90 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center space-x-1">
              <span>顾客: {order.customerName}</span>
              {order.customerPhone && (
                <span className="font-mono text-gray-600 flex items-center space-x-0.5">
                  <span>({order.customerPhone})</span>
                  <Phone className="w-3 h-3 text-[#00B578]" />
                </span>
              )}
            </span>
            <span className="text-xs font-black text-rose-600 font-mono">
              实收 ¥{order.payAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>订单号: {order.orderNo}</span>
            <span className="text-emerald-700 font-sans font-bold flex items-center space-x-0.5">
              <PackageCheck className="w-3 h-3" />
              <span>已完成备货</span>
            </span>
          </div>
        </div>

        {/* Product Details Section (商家端备货后核销展示商品明细) */}
        <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800 pb-1.5 border-b border-gray-200/70">
            <div className="flex items-center space-x-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#00B578]" />
              <span>待核销交付商品明细</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500">
              共 <span className="font-bold text-gray-800 font-mono">{totalQuantity}</span> 件
            </span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2.5 bg-white p-2 rounded-xl border border-gray-100 shadow-2xs"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100 border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {item.title}
                    </div>
                    {item.spec && (
                      <div className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-gray-100 line-clamp-1">
                        {item.spec}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-mono text-gray-500 text-[11px]">
                        ¥{item.price.toFixed(2)} × {item.quantity}
                      </span>
                      <span className="font-mono font-bold text-gray-900">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-3 text-center">暂无商品明细</div>
            )}
          </div>
        </div>

        {/* Pickup Code Input Field with pickup time point */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-700 flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#00B578]" />
              <span>自提时间: <span className="font-mono text-[#00B578] font-bold">{formatPickupTimePoint(order.pickupTime || order.time)}</span></span>
            </div>
            {order.pickupCode && (
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                一键填入 ({order.pickupCode})
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.replace(/\D/g, ''));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="请输入6位数字提货码"
              className="w-full text-center text-2xl font-mono tracking-widest font-black py-3 pl-4 pr-12 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none bg-gray-50/50 text-gray-900 transition placeholder:text-gray-300 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
            <button
              type="button"
              onClick={handleQuickFill}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#00B578] hover:bg-emerald-50 rounded-xl transition cursor-pointer"
              title="扫一扫顾客核销码"
            >
              <ScanLine className="w-5 h-5 text-[#00B578]" />
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-1 text-rose-600 text-[11px] font-medium pt-0.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>核对无误 · 确认核销</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
