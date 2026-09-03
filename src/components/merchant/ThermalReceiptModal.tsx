import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { MerchantOrderItem } from './MerchantOrdersView';
import { playChime } from '../../utils/audio';

interface ThermalReceiptModalProps {
  order: MerchantOrderItem | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  onClose,
  onShowToast,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!order) return null;

  const handleExecutePrint = () => {
    setIsPrinting(true);
    playChime();
    setTimeout(() => {
      setIsPrinting(false);
      onShowToast(`已发送订单 ${order.orderNo} 打印任务至热敏打印机`);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3 font-mono my-auto max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Receipt Header Actions */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 font-sans">
          <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
            <Printer className="w-4 h-4 text-[#00B578]" />
            <span>热敏小票预览</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Layout */}
        <div className="bg-[#FFFDF9] border border-gray-200 rounded-xl p-3.5 shadow-inner text-gray-900 text-xs space-y-2 select-text">
          <div className="text-center font-bold text-sm tracking-wide">
            -- 社区生活商户联 --
          </div>
          <div className="text-center text-xs font-black">
            老街坊正宗牛肉面 (红谷滩店)
          </div>
          <div className="border-t border-dashed border-gray-300 my-1" />

          <div className="space-y-0.5 text-[11px] text-gray-600">
            <div>时间: {order.time}</div>
            {order.channel !== 'offline' && (
              <div>自提时间: {order.pickupTime || order.time}</div>
            )}
            <div>单号: {order.orderNo}</div>
            <div>
              渠道: <span className="font-bold text-black">{order.channel === 'offline' ? '【线下买单】' : '【线上预定】'}</span>
            </div>
            {order.channel !== 'offline' && order.pickupCode && (
              <div className="font-bold text-emerald-800">
                提货码: {order.pickupCode}
              </div>
            )}
            <div>
              顾客: {order.customerName} ({order.customerPhone || '138****5621'})
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-1" />

          {/* Items list on Receipt */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-[11px] text-gray-500">
              <span>商品名称</span>
              <span>数量/金额</span>
            </div>
            {order.items?.map((it, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-[11px] space-x-2"
              >
                <div className="font-bold truncate flex-1">{it.title}</div>
                <div className="shrink-0">
                  x{it.quantity} ¥{(it.price * it.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-1" />

          {/* Totals & Discounts Section */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-700">
              <span>订单金额:</span>
              <span>¥{order.orderAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>让利优惠:</span>
              <span>-{order.rebateDiscount.toFixed(2)} PV</span>
            </div>
            <div className="flex justify-between text-amber-700 font-bold">
              <span>已抵扣金额:</span>
              <span>-¥{order.deductedAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-1 mt-1 flex justify-between text-sm font-black text-black">
              <span>实付金额:</span>
              <span>¥{order.payAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-1" />

          {/* Simulated Barcode */}
          <div className="text-center pt-1 space-y-1">
            <div className="h-7 bg-repeating-linear-gradient flex items-center justify-center font-mono text-[10px] tracking-widest text-gray-700 bg-gray-200 rounded">
              ||||| | |||| ||| |||| | |||||
            </div>
            <div className="text-[10px] text-gray-400">谢谢惠顾，欢迎再次光临！</div>
          </div>
        </div>

        {/* Print Trigger Button */}
        <div className="pt-1 flex items-center space-x-2 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 cursor-pointer"
          >
            关闭
          </button>
          <button
            type="button"
            disabled={isPrinting}
            onClick={handleExecutePrint}
            className="flex-1 py-2 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
          >
            {isPrinting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>正在打印...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>立即打印小票</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
