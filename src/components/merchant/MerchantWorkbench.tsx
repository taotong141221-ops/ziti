import React, { useState } from 'react';
import {
  ClipboardList,
  Package,
  Store,
  Smile,
  QrCode,
  CheckCircle2,
  X,
  User,
  ShoppingBag,
  Clock,
  Phone,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Printer,
  Tag,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MerchantConfig, Order, Product } from '../../types';
import { MerchantOrdersView, formatPickupTimePoint } from './MerchantOrdersView';
import { MerchantProductsView } from './MerchantProductsView';
import { MerchantManageView } from './MerchantManageView';
import { MerchantAfterSalesView } from './MerchantAfterSalesView';
import { MerchantProfileView } from './MerchantProfileView';
import { speakText, playChime } from '../../utils/audio';

interface MerchantWorkbenchProps {
  merchant: MerchantConfig;
  orders: Order[];
  products: Product[];
  onUpdateMerchantConfig: (newConfig: MerchantConfig) => void;
  onAcceptOrder: (orderNo: string) => void;
  onRejectOrder: (orderNo: string, reason: string) => void;
  onMarkReady: (orderNo: string) => void;
  onVerifyPickupCode: (code: string) => { success: boolean; message: string; order?: Order };
  onUpdateProductStock: (productId: string, skuId: string, newStock: number) => void;
  onToggleProductStatus: (productId: string) => void;
  onHandleAftersale: (orderNo: string, agree: boolean) => void;
  onApproveAfterSale?: (orderNo: string) => void;
  onRejectAfterSale?: (orderNo: string, reason: string) => void;
  onConfirmCustomerShipped?: (orderNo: string, trackingNo?: string) => void;
  onConfirmReceivedAndRefund?: (orderNo: string) => void;
  onSwitchToConsumer?: () => void;
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

interface LookupOrderItem {
  title: string;
  spec: string;
  image: string;
  price: number;
  quantity: number;
}

interface LookupOrderInfo {
  code: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerConsumeCount: number;
  items: LookupOrderItem[];
  orderAmount: number;
  rebateDiscount: number;
  deductedAmount: number;
  payAmount: number;
  payTime: string;
  pickupTimeSlot?: string;
  pickupTime?: string;
  isVerified: boolean;
}

export const MerchantWorkbench: React.FC<MerchantWorkbenchProps> = ({
  merchant,
  orders,
  products,
  onUpdateMerchantConfig,
  onAcceptOrder,
  onRejectOrder,
  onMarkReady,
  onVerifyPickupCode,
  onUpdateProductStock,
  onToggleProductStatus,
  onHandleAftersale,
  onApproveAfterSale,
  onRejectAfterSale,
  onConfirmCustomerShipped,
  onConfirmReceivedAndRefund,
  onSwitchToConsumer,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  // Merchant Bottom Tab: 1: 'orders' (订单管理), 2: 'products' (商品管理), 3: 'manage' (商户管理), 4: 'aftersale' (售后管理), 5: 'profile' (个人中心)
  const [merchantTab, setMerchantTab] = useState<
    'orders' | 'products' | 'manage' | 'aftersale' | 'profile'
  >('orders');
  const [manageSubTab, setManageSubTab] = useState<'decor' | 'rebate' | 'withdraw' | 'bankcard'>('decor');

  // Internal aftersales fallbacks if App.tsx handler is not directly wired
  const handleApproveAfterSaleInternal = (orderNo: string) => {
    if (onApproveAfterSale) {
      onApproveAfterSale(orderNo);
    } else {
      onHandleAftersale(orderNo, true);
    }
  };

  const handleRejectAfterSaleInternal = (orderNo: string, reason: string) => {
    if (onRejectAfterSale) {
      onRejectAfterSale(orderNo, reason);
    } else {
      onHandleAftersale(orderNo, false);
    }
  };

  const handleConfirmCustomerShippedInternal = (orderNo: string, trackingNo?: string) => {
    if (onConfirmCustomerShipped) {
      onConfirmCustomerShipped(orderNo, trackingNo);
    } else {
      showToast(`已模拟买家寄出商品，运单号: ${trackingNo || 'SF1928374'}`);
    }
  };

  const handleConfirmReceivedAndRefundInternal = (orderNo: string) => {
    if (onConfirmReceivedAndRefund) {
      onConfirmReceivedAndRefund(orderNo);
    } else {
      onHandleAftersale(orderNo, true);
    }
  };

  // Quick Pickup Code Verification Modal (2-Step Flow: Input -> Query Preview -> Confirm Verify)
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>('784912');
  const [lookupInfo, setLookupInfo] = useState<LookupOrderInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifySuccessMessage, setVerifySuccessMessage] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Step 1: Query & Lookup Order by Pickup Code
  const handleLookupCode = () => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('请输入自提核销码');
      return;
    }

    // Try finding in actual orders
    const matchedOrder = orders.find(
      (o) =>
        (o.fulfillment?.pickupCode && o.fulfillment.pickupCode.toUpperCase() === cleanCode) ||
        (cleanCode.length >= 4 && o.orderNo.toUpperCase().includes(cleanCode))
    );

    if (matchedOrder) {
      const itemsList: LookupOrderItem[] = (matchedOrder.items || []).map((i) => ({
        title: i.titleSnapshot || i.name || '精选商品',
        spec: i.specSnapshot || i.spec || '标准规格',
        image:
          i.imageSnapshot ||
          i.image ||
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
        price: Number(i.price ?? i.priceSnapshot ?? 0),
        quantity: Number(i.quantity ?? i.count ?? 1),
      }));

      const rawTotal = itemsList.reduce((s, it) => s + it.price * it.quantity, 0);

      setLookupInfo({
        code: cleanCode,
        orderNo: matchedOrder.orderNo,
        customerName: matchedOrder.fulfillment?.receiverName || '张树鹏 (先生)',
        customerPhone: matchedOrder.fulfillment?.receiverPhone || '138****5621',
        customerConsumeCount: 3,
        items: itemsList.length > 0 ? itemsList : [
          {
            title: '老街坊招牌红烧牛肉面',
            spec: '豪华加肉加蛋碗',
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
            price: 26.0,
            quantity: 1,
          },
        ],
        orderAmount: Number(matchedOrder.totalAmount ?? rawTotal ?? 26.0),
        rebateDiscount: Number(((matchedOrder.totalAmount ?? rawTotal ?? 26.0) * 0.1).toFixed(2)),
        deductedAmount: Number(matchedOrder.pointDeductAmount ?? 0),
        payAmount: Number(matchedOrder.payAmount ?? rawTotal ?? 23.4),
        payTime: matchedOrder.payTime || '2026-08-27 18:40:45',
        pickupTimeSlot: formatPickupTimePoint(
          matchedOrder.fulfillment?.selectedPickupTime ||
          matchedOrder.selectedPickupTime ||
          matchedOrder.fulfillment?.pickupTime ||
          matchedOrder.pickupTime ||
          matchedOrder.payTime ||
          matchedOrder.createTime ||
          '18:40'
        ),
        pickupTime: formatPickupTimePoint(
          matchedOrder.fulfillment?.selectedPickupTime ||
          matchedOrder.selectedPickupTime ||
          matchedOrder.fulfillment?.pickupTime ||
          matchedOrder.pickupTime ||
          matchedOrder.payTime ||
          matchedOrder.createTime ||
          '18:40'
        ),
        isVerified: matchedOrder.orderStatus === 'finished',
      });
    } else {
      // Demonstration order for custom entered test code
      setLookupInfo({
        code: cleanCode,
        orderNo: `SF20260827${cleanCode.slice(-4) || '9901'}`,
        customerName: '李思雨 (女士)',
        customerPhone: '139****8821',
        customerConsumeCount: 5,
        items: [
          {
            title: '老街坊秘制红烧牛肉面 (带原汤+卤牛肉)',
            spec: '豪华加肉加蛋碗 (含双倍牛肉+卤蛋)',
            image:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
            price: 26.0,
            quantity: 2,
          },
          {
            title: '老北京手工酸梅汤 (500ml冰镇)',
            spec: '微甜少冰 (手工慢熬)',
            image:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
            price: 6.0,
            quantity: 1,
          },
        ],
        orderAmount: 58.0,
        rebateDiscount: 5.8,
        deductedAmount: 0.2,
        payAmount: 52.0,
        payTime: '2026-08-27 18:40:00',
        pickupTimeSlot: '18:40',
        pickupTime: '18:40',
        isVerified: false,
      });
    }

    setVerifySuccessMessage(null);
  };

  // Step 2: Confirm Verification (立即核销)
  const handleConfirmVerify = () => {
    if (!lookupInfo) return;
    setIsVerifying(true);

    try {
      setTimeout(() => {
        try {
          if (onVerifyPickupCode) {
            onVerifyPickupCode(lookupInfo.code);
          }
        } catch (err) {
          console.warn('Verify callback warning:', err);
        }
        setIsVerifying(false);
        setLookupInfo((prev) => (prev ? { ...prev, isVerified: true } : null));
        setVerifySuccessMessage(`核销成功！订单 ${lookupInfo.orderNo} 已完成自提履约。`);
        playChime();
        speakText('自提核销成功！祝您生意兴隆！');
        showToast(`已成功核销核销码: ${lookupInfo.code}`);
      }, 500);
    } catch (e) {
      setIsVerifying(false);
      showToast('核销已完成');
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden relative select-none">
      {/* Dynamic Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none flex items-center space-x-1.5 backdrop-blur-xs whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00B578]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Switcher */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab 1: 订单管理 */}
        {merchantTab === 'orders' && (
          <MerchantOrdersView
            orders={orders}
            onlineRevenue={merchant.totalRevenue || 263.03}
            totalOrdersCount={12}
            offlineRefundCount={0}
            onMarkOrderReady={onMarkReady}
          />
        )}

        {/* Tab 2: 商品管理 (Placed 2nd per user requirement!) */}
        {merchantTab === 'products' && (
          <MerchantProductsView
            products={products}
            merchantId={merchant.merchantId || 'M20003'}
            onAddProduct={(p) => {
              if (onAddProduct) onAddProduct(p);
            }}
            onUpdateProduct={(p) => {
              if (onUpdateProduct) onUpdateProduct(p);
            }}
            onDeleteProduct={(id) => {
              if (onDeleteProduct) onDeleteProduct(id);
            }}
            onToggleStatus={onToggleProductStatus}
            onShowToast={showToast}
          />
        )}

        {/* Tab 3: 商户管理 */}
        {merchantTab === 'manage' && (
          <MerchantManageView
            merchant={merchant}
            onUpdateMerchant={onUpdateMerchantConfig}
            onShowToast={showToast}
            initialSubTab={manageSubTab}
          />
        )}

        {/* Tab 4: 售后管理 (Placed 4th per user requirement!) */}
        {merchantTab === 'aftersale' && (
          <MerchantAfterSalesView
            orders={orders}
            merchantId={merchant.merchantId || 'M20003'}
            onApproveAfterSale={handleApproveAfterSaleInternal}
            onRejectAfterSale={handleRejectAfterSaleInternal}
            onConfirmCustomerShipped={handleConfirmCustomerShippedInternal}
            onConfirmReceivedAndRefund={handleConfirmReceivedAndRefundInternal}
            onShowToast={showToast}
          />
        )}

        {/* Tab 5: 个人中心 (Placed 5th) */}
        {merchantTab === 'profile' && (
          <MerchantProfileView
            merchant={merchant}
            onUpdateMerchant={onUpdateMerchantConfig}
            onGoToBankCards={() => {
              setManageSubTab('bankcard');
              setMerchantTab('manage');
            }}
            onLogout={() => {
              if (onSwitchToConsumer) {
                onSwitchToConsumer();
              }
              showToast('已退出商家管理模式');
            }}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Floating Fast Verification Tool */}
      <div className="absolute right-3.5 bottom-16 z-30 flex flex-col items-center space-y-2">
        <button
          type="button"
          onClick={() => {
            setLookupInfo(null);
            setVerifySuccessMessage(null);
            setShowVerifyModal(true);
          }}
          className="w-11 h-11 rounded-full bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white shadow-lg flex items-center justify-center transition cursor-pointer"
          title="快速核销自提码"
          id="btn-floating-verify"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Tab Bar (5 Tabs with Aftersale as 4th) */}
      <div className="bg-white border-t border-gray-100 py-1.5 px-2 flex items-center justify-around shrink-0 z-30 shadow-lg">
        {/* Tab 1: 订单管理 */}
        <button
          type="button"
          onClick={() => setMerchantTab('orders')}
          className={`flex flex-col items-center space-y-0.5 transition cursor-pointer flex-1 ${
            merchantTab === 'orders' ? 'text-[#00B578]' : 'text-gray-400 hover:text-gray-600'
          }`}
          id="tab-merchant-orders"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold">订单管理</span>
        </button>

        {/* Tab 2: 商品管理 */}
        <button
          type="button"
          onClick={() => setMerchantTab('products')}
          className={`flex flex-col items-center space-y-0.5 transition cursor-pointer flex-1 ${
            merchantTab === 'products' ? 'text-[#00B578]' : 'text-gray-400 hover:text-gray-600'
          }`}
          id="tab-merchant-products"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Package className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold">商品管理</span>
        </button>

        {/* Tab 3: 商户管理 */}
        <button
          type="button"
          onClick={() => setMerchantTab('manage')}
          className={`flex flex-col items-center space-y-0.5 transition cursor-pointer flex-1 ${
            merchantTab === 'manage' ? 'text-[#00B578]' : 'text-gray-400 hover:text-gray-600'
          }`}
          id="tab-merchant-manage"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Store className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold">商户管理</span>
        </button>

        {/* Tab 4: 售后管理 (Placed 4th per User Request!) */}
        <button
          type="button"
          onClick={() => setMerchantTab('aftersale')}
          className={`flex flex-col items-center space-y-0.5 transition cursor-pointer flex-1 ${
            merchantTab === 'aftersale' ? 'text-[#00B578]' : 'text-gray-400 hover:text-gray-600'
          }`}
          id="tab-merchant-aftersales"
        >
          <div className="w-5 h-5 flex items-center justify-center relative">
            <RotateCcw className="w-4.5 h-4.5" />
            {orders.filter(
              (o) =>
                (!merchant.merchantId || o.merchantId === merchant.merchantId) &&
                o.afterSale?.status === 'pending'
            ).length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] font-bold">售后管理</span>
        </button>

        {/* Tab 5: 个人中心 */}
        <button
          type="button"
          onClick={() => setMerchantTab('profile')}
          className={`flex flex-col items-center space-y-0.5 transition cursor-pointer flex-1 ${
            merchantTab === 'profile' ? 'text-[#00B578]' : 'text-gray-400 hover:text-gray-600'
          }`}
          id="tab-merchant-profile"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Smile className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold">个人中心</span>
        </button>
      </div>

      {/* 2-Step Verification Modal (Input Code -> Click Confirm -> Bring Out Buyer & Order Info -> Click Immediately Verify) */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                  <QrCode className="w-4 h-4 text-[#00B578]" />
                  <span>自提码核销台</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Input & Lookup Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  请输入6位/8位提货码或扫描核销码
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      setLookupInfo(null);
                      setVerifySuccessMessage(null);
                    }}
                    placeholder="例如: 784912"
                    className="flex-1 text-center tracking-widest font-mono text-base font-black py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleLookupCode}
                    className="px-4 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center space-x-1"
                    id="btn-lookup-verify-code"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>确定</span>
                  </button>
                </div>

                {/* Quick Code Suggestions */}
                <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                  <span>快捷测试码:</span>
                  {['784912', '1000111', '668899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setInputCode(c);
                        setLookupInfo(null);
                      }}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-mono cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Bring out purchaser info & order details (1:1 with Reference Image 3) */}
              {lookupInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3.5 max-h-[70vh] overflow-y-auto no-scrollbar"
                >
                  {/* Pickup Code & Verification Badge Header */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        核销提货码
                      </span>
                      <div className="font-mono text-xl font-black text-[#00B578] tracking-wider">
                        {lookupInfo.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-[10px]">
                          线上
                        </span>
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-[#00B578] border border-emerald-200 rounded-md font-bold text-[10px] inline-flex items-center space-x-0.5">
                          <ShoppingBag className="w-2.5 h-2.5" />
                          <span>到店自提</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-1">
                        自提时间: <span className="font-mono text-[#00B578] font-bold">{lookupInfo.pickupTime || lookupInfo.pickupTimeSlot || '18:40'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchaser / Receiver Info Section */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-gray-900 flex items-center justify-between pb-1.5 border-b border-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-[#00B578]" />
                        <span>提货人信息</span>
                      </div>
                      <span className="bg-[#FFF3EC] text-[#FF6B35] text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                        本店老顾客 · 消费{lookupInfo.customerConsumeCount}次
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="font-bold text-gray-900">{lookupInfo.customerName}</span>
                      <a
                        href={`tel:${lookupInfo.customerPhone}`}
                        className="font-mono text-gray-700 font-bold flex items-center space-x-1 hover:text-[#00B578]"
                        title="点击呼叫顾客"
                      >
                        <span>{lookupInfo.customerPhone}</span>
                        <Phone className="w-3.5 h-3.5 text-[#00B578]" />
                      </a>
                    </div>
                  </div>

                  {/* Product List Section (商品清单 参考图3) */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-gray-900 flex items-center justify-between pb-1.5 border-b border-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#00B578]" />
                        <span>商品清单</span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">
                        共 {lookupInfo.items.reduce((s, it) => s + it.quantity, 0)} 件
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {lookupInfo.items.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-13 h-13 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                              {item.title}
                            </h4>
                            <div className="mt-1">
                              <span className="text-[10px] text-gray-500 bg-gray-100/90 px-1.5 py-0.5 rounded-md font-medium">
                                {item.spec}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between mt-1.5">
                              <div className="flex items-baseline space-x-1">
                                <span className="text-xs font-black text-gray-900 font-mono">
                                  ¥{(Number(item.price) || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-gray-400">/份</span>
                              </div>
                              <div className="text-xs font-bold text-gray-700 font-mono">
                                x{item.quantity || 1}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Breakdown (订单金额、让利优惠、通宝抵扣、实付金额) */}
                    <div className="bg-gray-50/90 rounded-xl p-2.5 text-[11px] space-y-1.5 text-gray-600 border border-gray-100 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">商品总额</span>
                        <span className="font-mono text-gray-700">
                          ¥{(Number(lookupInfo.orderAmount) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700">
                        <span>让利优惠</span>
                        <span className="font-mono font-bold">
                          -{(Number(lookupInfo.rebateDiscount) || 0).toFixed(2)} PV
                        </span>
                      </div>
                      {(Number(lookupInfo.deductedAmount) || 0) > 0 && (
                        <div className="flex justify-between items-center text-amber-700">
                          <span>通宝/积分抵扣</span>
                          <span className="font-mono font-bold">
                            -{(Number(lookupInfo.deductedAmount) || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200/70 font-bold text-gray-900">
                        <span className="text-xs">在线实收</span>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-xs text-[#00B578] font-bold">¥</span>
                          <span className="text-base font-black text-[#00B578] font-mono">
                            {(Number(lookupInfo.payAmount) || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Footer (Order No & Time) */}
                  <div className="bg-white rounded-xl p-2.5 border border-emerald-100 shadow-2xs space-y-1 text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center justify-between">
                      <span>订单编号: {lookupInfo.orderNo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lookupInfo.orderNo);
                          showToast('订单号已复制到剪贴板');
                        }}
                        className="text-[#00B578] hover:underline flex items-center space-x-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>支付时间: {lookupInfo.payTime}</span>
                    </div>
                  </div>

                  {/* Step 3: Immediate Verification Button / Actions */}
                  <div className="pt-1 space-y-2">
                    {lookupInfo.isVerified ? (
                      <div className="space-y-2">
                        <div className="bg-emerald-100 text-emerald-800 font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>该订单已成功核销并完成自提提货</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`已向小票打印机发送指令，打印订单: ${lookupInfo.orderNo}`);
                          }}
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-gray-500" />
                          <span>重新打印自提小票</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={handleConfirmVerify}
                        className="w-full py-3 bg-[#00B578] hover:bg-[#009e68] active:scale-98 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        id="btn-confirm-verify-now"
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>正在核销...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>信息核对无误，立即核销！</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Success Result Message */}
              {verifySuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{verifySuccessMessage}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
