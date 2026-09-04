import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { MerchantOrderItem, formatPickupTimePoint } from './MerchantOrdersView';
import { playChime } from '../../utils/audio';
import { getReceiptPrintCount, incrementReceiptPrintCount } from '../../utils/receiptPrinter';

interface ThermalReceiptModalProps {
  order: MerchantOrderItem | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onPrintSuccess?: (orderNo: string, newCount: number) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  onClose,
  onShowToast,
  onPrintSuccess,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const initialPrintCount = order ? (getReceiptPrintCount(order.orderNo) || (order.printCount ?? 0)) : 0;
  const [currentPrintCount, setCurrentPrintCount] = useState<number>(initialPrintCount);

  if (!order) return null;

  const isReprint = currentPrintCount > 0;

  const handleExecutePrint = () => {
    setIsPrinting(true);
    playChime();
    const newCount = incrementReceiptPrintCount(order.orderNo);
    setCurrentPrintCount(newCount);
    if (onPrintSuccess) {
      onPrintSuccess(order.orderNo, newCount);
    }
    setTimeout(() => {
      setIsPrinting(false);
      if (isReprint) {
        onShowToast(`提醒：该小票已打印 ${currentPrintCount} 次！已发送第 ${newCount} 次重打小票至热敏打印机`);
      } else {
        onShowToast(`已发送订单 ${order.orderNo} 打印任务至热敏打印机`);
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 font-mono my-auto max-h-[90vh] overflow-y-auto no-scrollbar"
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
            {order.isExchangeReceipt ? '-- 售后换货凭据 (商户联) --' : '-- 社区生活商户联 --'}
          </div>
          <div className="text-center text-xs font-black">
            老街坊正宗牛肉面 (红谷滩店)
          </div>

          {/* 小票二次打印提醒 */}
          {isReprint && (
            <div className="text-center font-black text-xs text-rose-600 py-1 my-1 border-y border-dashed border-rose-300 bg-rose-50/50">
              ⚠️ 提醒：该小票已打印 {currentPrintCount} 次！
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 my-1" />

          <div className="space-y-0.5 text-[11px] text-gray-600">
            {order.isExchangeReceipt && order.exchangeInfo?.exchangeTime && (
              <div className="text-blue-900 font-bold">换货时间: {order.exchangeInfo.exchangeTime}</div>
            )}
            <div>{order.isExchangeReceipt ? '下单时间:' : '时间:'} {order.time}</div>
            {order.channel !== 'offline' && (
              <div>自提时间: {formatPickupTimePoint(order.pickupTime || order.time)}</div>
            )}
            <div>单号: {order.orderNo}</div>
            <div>
              渠道: <span className="font-bold text-black">{order.channel === 'offline' ? '【线下买单】' : '【线上预定】'}</span>
            </div>
            {order.isExchangeReceipt && (
              <div className="text-blue-800 font-bold">
                售后业务: 【商品调换】
              </div>
            )}
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

          {/* If Exchange Receipt: Show Exchange New Product and Original Product */}
          {order.isExchangeReceipt && order.exchangeInfo ? (
            <div className="space-y-2">
              {/* 原退回商品 */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[11px] text-gray-500">原退回商品:</div>
                <div className="text-[11px] text-gray-600 pl-1">
                  {order.exchangeInfo.oldProductTitle || order.items[0]?.title || '原购买商品'}
                </div>
              </div>

              {/* 调换新商品 (新商品需在新小票上面清晰展示) */}
              <div className="space-y-1 text-xs bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                <div className="flex justify-between font-bold text-[11px] text-blue-900">
                  <span>调换新商品</span>
                  <span>数量/金额</span>
                </div>
                <div className="flex justify-between items-start text-[11px] space-x-2">
                  <div className="font-bold truncate flex-1 text-blue-950">
                    {order.exchangeInfo.newProductTitle}
                    {order.exchangeInfo.newSpec && (
                      <span className="block text-[10px] text-blue-700 font-normal">
                        规格: {order.exchangeInfo.newSpec}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-right font-bold text-blue-950">
                    x{order.exchangeInfo.newQuantity} ¥{(order.exchangeInfo.newPrice * order.exchangeInfo.newQuantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-1" />

              {/* 差价核算：商家不做退差价，只有消费者少补，没有多退 */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>原订单实付:</span>
                  <span>¥{order.payAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-900 font-bold">
                  <span>新商品金额:</span>
                  <span>¥{(order.exchangeInfo.newPrice * order.exchangeInfo.newQuantity).toFixed(2)}</span>
                </div>
                {order.exchangeInfo.diffAmount !== undefined && (
                  <div className="flex justify-between font-black text-xs pt-1 border-t border-dashed border-gray-200">
                    <span>差价结算:</span>
                    {order.exchangeInfo.diffAmount > 0 ? (
                      <span className="text-amber-700">顾客补差 +¥{order.exchangeInfo.diffAmount.toFixed(2)}</span>
                    ) : (
                      <span className="text-emerald-700">无需补退 (不退差价)</span>
                    )}
                  </div>
                )}
                {order.exchangeInfo.merchantNote && (
                  <div className="text-[10px] text-gray-500 pt-0.5">
                    换货备注: {order.exchangeInfo.merchantNote}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Items list on Standard Receipt */}
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
            </>
          )}

          <div className="border-t border-dashed border-gray-300 my-1" />

          {/* Simulated Barcode */}
          <div className="text-center pt-1 space-y-1">
            <div className="h-7 bg-repeating-linear-gradient flex items-center justify-center font-mono text-[10px] tracking-widest text-gray-700 bg-gray-200 rounded">
              ||||| | |||| ||| |||| | |||||
            </div>
            <div className="text-[10px] text-gray-400">
              {order.isExchangeReceipt ? '换货凭据已确认，欢迎再次光临！' : '谢谢惠顾，欢迎再次光临！'}
            </div>
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
            className="flex-1 py-2 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1 cursor-pointer transition bg-[#00B578] hover:bg-[#009e68]"
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
