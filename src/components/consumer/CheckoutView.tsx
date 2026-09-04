import React, { useState, useMemo } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  X,
  Edit2,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { MerchantConfig, CartItem, Order, DeliveryAddressItem } from '../../types';

interface CheckoutViewProps {
  merchant: MerchantConfig;
  merchants?: MerchantConfig[];
  cartItems: CartItem[];
  fulfillType?: string;
  onFulfillTypeChange?: (type: any) => void;
  onPlaceOrder: (newOrders: Order | Order[]) => void;
  onCancel: () => void;
  addresses?: DeliveryAddressItem[];
  selectedAddressId?: string;
  onSelectAddress?: (id: string) => void;
  onAddAddress?: (newAddr: Omit<DeliveryAddressItem, 'id'>) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  merchant,
  merchants = [],
  cartItems,
  onPlaceOrder,
}) => {
  const [merchantRemarks, setMerchantRemarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Contact / Reserved Phone (Image 2 style)
  const [contactPhone, setContactPhone] = useState<string>('17319170429');
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);

  // Time Selection Modal State
  const [isTimeModalOpen, setIsTimeModalOpen] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('12:42');

  // Time points (exact time points, consistent across consumer and merchant, purely HH:mm)
  const availableTimeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '11:47',
    '12:00',
    '12:42',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:15',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:38',
    '20:00',
    '20:30',
    '21:00',
  ];

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  // Preview Order No
  const previewOrderNo = useMemo(() => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate()
    ).padStart(2, '0')}`;
    return `SF${ymd}${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  // Group cart items by merchant
  const merchantGroups = useMemo(() => {
    const map = new Map<string, { merchant: MerchantConfig; items: CartItem[] }>();

    cartItems.forEach((item) => {
      let group = map.get(item.merchantId);
      if (!group) {
        const found =
          merchants.find((m) => m.merchantId === item.merchantId) ||
          (merchant.merchantId === item.merchantId ? merchant : null) || {
            merchantId: item.merchantId,
            name: '老街坊牛肉面馆',
            logo: item.image,
            category: '餐饮美食',
            rating: 4.9,
            monthlySales: 800,
            distanceKm: 0.373,
            auditStatus: 'approved' as const,
            pickupAddress: '城南大道 2799 号旭岚春天小区一期商业 E107 室',
            pickupLocation: { lng: 115.862, lat: 28.683 },
            businessHours: '06:30 - 22:00 / 全天营业',
            phone: '13870011223',
            isOpen: true,
            pickupOverdueFeeRate: 10,
          };
        group = { merchant: found, items: [] };
        map.set(item.merchantId, group);
      }
      group.items.push(item);
    });

    return Array.from(map.values());
  }, [cartItems, merchants, merchant]);

  // Total goods amount
  const totalGoodsAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Points and deductions state
  const availableFlowMoney = 85.0;
  const availableDirectedMoney = 120.05;

  const [useFlowMoney, setUseFlowMoney] = useState<boolean>(true);
  const [flowDeductInput, setFlowDeductInput] = useState<string>(
    Math.min(36.0, totalGoodsAmount).toFixed(2)
  );

  const [useDirectedMoney, setUseDirectedMoney] = useState<boolean>(false);
  const [directedDeductInput, setDirectedDeductInput] = useState<string>('0.00');

  const orderTotal = Number(totalGoodsAmount.toFixed(2));

  const flowVal = parseFloat(flowDeductInput) || 0;
  const actualFlowDeduct = useFlowMoney
    ? Math.min(Math.max(0, flowVal), availableFlowMoney, orderTotal)
    : 0;

  const directedVal = parseFloat(directedDeductInput) || 0;
  const actualDirectedDeduct = useDirectedMoney
    ? Math.min(
        Math.max(0, directedVal),
        availableDirectedMoney,
        Math.max(0, orderTotal - actualFlowDeduct)
      )
    : 0;

  const totalDiscount = Number((actualFlowDeduct + actualDirectedDeduct).toFixed(2));
  const payAmount = Number(Math.max(0, orderTotal - totalDiscount).toFixed(2));
  const pointBonus = Math.max(0.01, Number((payAmount * 0.005 + 0.01).toFixed(2)));

  // Submit order
  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const ordersToCreate: Order[] = merchantGroups.map(({ merchant: m, items }) => {
        const storeGoodsAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const ratio = orderTotal > 0 ? storeGoodsAmount / orderTotal : 1 / merchantGroups.length;
        const storeDiscount = Number((totalDiscount * ratio).toFixed(2));
        const storePayAmount = Number(Math.max(0, storeGoodsAmount - storeDiscount).toFixed(2));
        const storePointBonus = Math.max(0.01, Number((storePayAmount * 0.02).toFixed(2)));

        const subOrderNo =
          merchantGroups.length === 1
            ? previewOrderNo
            : `SF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(
                100000 + Math.random() * 900000
              )}`;
        const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
        const feeRate = m.pickupOverdueFeeRate || 10;

        return {
          orderNo: subOrderNo,
          userId: 'U10086',
          merchantId: m.merchantId,
          merchantName: m.name,
          merchantAddress: m.pickupAddress,
          merchantPhone: m.phone,
          fulfillType: 'pickup',
          orderStatus: 'ready_pickup',
          selectedPickupTime: nowStr,
          isOverduePickup: false,
          overdueFeeRate: feeRate,
          items: items.map((item) => ({
            skuId: item.skuId,
            productId: item.productId,
            titleSnapshot: item.title,
            specSnapshot: item.specDesc,
            imageSnapshot: item.image,
            priceSnapshot: item.price,
            quantity: item.quantity,
            itemAmount: item.price * item.quantity,
            pointAwarded: storePointBonus,
          })),
          goodsAmount: storeGoodsAmount,
          deliveryFee: 0.0,
          pointDeductAmount: storeDiscount,
          discountAmount: storeDiscount,
          payAmount: storePayAmount,
          payStatus: 1,
          createTime: nowStr,
          payTime: nowStr,
          acceptTime: nowStr,
          readyTime: nowStr,
          fulfillment: {
            fulfillType: 'pickup',
            pickupCode,
            qrToken: `QR_TOK_${subOrderNo}_${pickupCode}`,
            codeStatus: 'unused',
            selectedPickupTime: nowStr,
            receiverName: '自提客户',
            receiverPhone: contactPhone,
            pickupAddress: m.pickupAddress,
          },
          remark: merchantRemarks[m.merchantId] || '',
        };
      });

      setIsSubmitting(false);
      onPlaceOrder(ordersToCreate.length === 1 ? ordersToCreate[0] : ordersToCreate);
    }, 400);
  };

  const currentPrimaryMerchant = merchantGroups[0]?.merchant || merchant;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F7FA] relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3 pb-24">
        {/* 1. 门店自提与地址卡片 (带地图背景设计，去掉了营业时间和电话，严格参考图 2) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3.5 relative overflow-hidden">
          {/* Subtle Map Graphic Background at Address Area */}
          <div className="relative rounded-xl p-3.5 border border-gray-100 overflow-hidden bg-gradient-to-br from-emerald-50/20 via-slate-50/40 to-white">
            {/* SVG Map Lines / Road Grid Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="0.8" />
                  <circle cx="20" cy="20" r="1.5" fill="#10B981" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
              <path
                d="M-20 30 Q 80 10 160 50 T 360 20"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                opacity="0.25"
                strokeDasharray="4 4"
              />
              <path
                d="M50 -10 Q 120 70 200 60 T 320 100"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
                opacity="0.15"
              />
            </svg>

            {/* Address Row & Distance (Reference Image 2) */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-sm font-black text-gray-900 leading-snug tracking-tight">
                  {currentPrimaryMerchant.pickupAddress ||
                    '城南大道 2799 号旭岚春天小区一期商业 E107 室'}
                </h3>
              </div>

              {/* Right: Distance & Store Icon (Reference Image 2) */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center text-xs font-bold text-gray-500 hover:text-emerald-700 cursor-pointer transition">
                  <span>距你373m</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
                </div>
                <div className="w-9 h-9 mt-1.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src={currentPrimaryMerchant.logo || cartItems[0]?.image}
                    alt={currentPrimaryMerchant.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 自取时间 (Reference Image 2: "自取时间" ... "11:47 >" in green font) */}
          <div
            onClick={() => setIsTimeModalOpen(true)}
            className="flex items-center justify-between py-1.5 px-1 cursor-pointer group"
          >
            <span className="text-xs font-medium text-gray-800">自取时间</span>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold text-[#00B578] font-mono group-hover:opacity-80 transition">
                {selectedTimeSlot}
              </span>
              <ChevronRight className="w-4 h-4 text-[#00B578]" />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Row 3: 预留电话 (Reference Image 2: "预留电话" ... "17319170429 ✏️" in orange font) */}
          <div className="flex items-center justify-between py-1.5 px-1">
            <span className="text-xs font-medium text-gray-800">预留电话</span>
            {isEditingPhone ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="font-mono font-bold text-sm text-[#FF6600] border-b border-[#FF6600] focus:outline-none w-32 px-1 py-0.5 bg-transparent"
                  autoFocus
                  onBlur={() => setIsEditingPhone(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingPhone(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="text-[11px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded"
                >
                  确定
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingPhone(true)}
                className="flex items-center space-x-1.5 cursor-pointer group"
              >
                <span className="text-sm font-bold text-[#FF6600] font-mono group-hover:opacity-80 transition">
                  {contactPhone}
                </span>
                <Edit2 className="w-3.5 h-3.5 text-[#FF6600] group-hover:scale-110 transition" />
              </div>
            )}
          </div>
        </div>

        {/* 2. Product List Card (Matching Image 2) */}
        <div className="space-y-3">
          {merchantGroups.map(({ merchant: m, items }) => {
            const storeSum = items.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <div
                key={m.merchantId}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <img
                      src={m.logo}
                      alt={m.name}
                      className="w-5 h-5 rounded-md object-cover border border-gray-200"
                    />
                    <span className="text-xs font-black text-gray-900">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">共 {items.length} 种商品</span>
                </div>

                <div className="divide-y divide-gray-50 space-y-2">
                  {items.map((item) => (
                    <div key={item.skuId} className="flex space-x-3 pt-2 first:pt-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0 border border-gray-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="text-xs font-bold text-gray-900 truncate">{item.title}</div>
                        <div className="text-[10px] text-gray-400">{item.specDesc}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-gray-900 font-mono">
                            ¥{item.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merchant Remark (Image 2 style) */}
                <div className="pt-2 border-t border-gray-100 flex items-center space-x-2 text-xs">
                  <span className="text-gray-500 shrink-0 font-medium">商户备注:</span>
                  <input
                    type="text"
                    placeholder="给商家留言 / 无接触配送要求等"
                    value={merchantRemarks[m.merchantId] || ''}
                    onChange={(e) =>
                      setMerchantRemarks({
                        ...merchantRemarks,
                        [m.merchantId]: e.target.value,
                      })
                    }
                    className="flex-1 text-xs text-gray-800 focus:outline-none placeholder-gray-300 bg-transparent"
                  />
                </div>

                {/* Subtotal */}
                <div className="pt-2 border-t border-gray-50 text-right text-xs">
                  <span className="text-gray-500">店铺商品小计: </span>
                  <span className="font-black text-gray-900 font-mono">¥{storeSum.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. 使用抵扣明细 (Exact layout matching Image 1 & 2) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-4">
          {/* 使用流通金抵扣 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-gray-900">使用流通金抵扣</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  可用流通金: <span className="text-emerald-700 font-mono font-bold">¥ {availableFlowMoney.toFixed(2)}</span>
                </p>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  const next = !useFlowMoney;
                  setUseFlowMoney(next);
                  if (next && (parseFloat(flowDeductInput) === 0 || !flowDeductInput)) {
                    setFlowDeductInput(Math.min(36.0, availableFlowMoney, totalGoodsAmount).toFixed(2));
                  }
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  useFlowMoney ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    useFlowMoney ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {useFlowMoney && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600 font-medium">抵扣金额:</span>
                <div className="bg-[#F0F2F5] px-4 py-1 rounded-full flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={Math.min(availableFlowMoney, orderTotal)}
                    value={flowDeductInput}
                    onChange={(e) => setFlowDeductInput(e.target.value)}
                    className="w-20 text-center bg-transparent text-xs font-black text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* 使用定向消费金抵扣 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-gray-900">使用定向消费金抵扣</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  可用定向消费金: <span className="text-emerald-700 font-mono font-bold">¥ {availableDirectedMoney.toFixed(2)}</span>
                </p>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  const next = !useDirectedMoney;
                  setUseDirectedMoney(next);
                  if (next && (parseFloat(directedDeductInput) === 0 || !directedDeductInput)) {
                    setDirectedDeductInput(
                      Math.min(availableDirectedMoney, Math.max(0, orderTotal - actualFlowDeduct)).toFixed(2)
                    );
                  }
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  useDirectedMoney ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    useDirectedMoney ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {useDirectedMoney && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600 font-medium">抵扣金额:</span>
                <div className="bg-[#F0F2F5] px-4 py-1 rounded-full flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={Math.min(availableDirectedMoney, Math.max(0, orderTotal - actualFlowDeduct))}
                    value={directedDeductInput}
                    onChange={(e) => setDirectedDeductInput(e.target.value)}
                    className="w-20 text-center bg-transparent text-xs font-black text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. 订单编号与金额明细 Card (Exact match Image 1 & 2) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
            <span>订单编号</span>
            <span className="font-mono text-gray-700">{previewOrderNo}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-800 font-bold">
            <span>订单总金额</span>
            <span className="font-mono font-bold">¥ {totalGoodsAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>立减金额</span>
            <span className="font-mono">- ¥ {totalDiscount.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-end text-xs space-x-1.5">
            <span className="text-gray-800 font-bold">本次实付金额:</span>
            <span className="text-base font-black text-rose-600 font-mono">
              ¥ {payAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 超时退款扣除服务费提醒 */}
        <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/80 flex items-start space-x-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-amber-900 leading-relaxed">
            <div className="font-black text-amber-950 flex items-center space-x-1.5">
              <span>超时退款与自提须知</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">温馨提醒</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-snug">
              请在约定自提时间内凭提货码到店核销。若超过自提截止时间未提货导致系统自动发起退款，将扣除相应备货保鲜服务费，剩余金额原路返还。
            </p>
          </div>
        </div>

        {/* 6. 本次消费可获得积分福利 Card (Exact match Image 1) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center justify-between text-xs">
          <span className="font-bold text-gray-900">本次消费可获得积分福利</span>
          <span className="font-bold text-emerald-600 font-mono">+ ¥ {pointBonus.toFixed(2)}</span>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Exact match Image 2) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-lg flex items-center justify-between z-20">
        <div className="flex items-baseline space-x-1">
          <span className="text-xs text-gray-700 font-bold">实付款:</span>
          <span className="text-base font-black text-rose-600 font-mono">¥{payAmount.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-full bg-[#00B578] hover:bg-[#00A16A] active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          id="btn-submit-order"
        >
          {isSubmitting ? (
            <span>提交中...</span>
          ) : (
            <>
              <span>立即支付</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* 7. 选择自取时间弹窗 (纯时间段，无今天/明天/尽快到店，弹窗展示) */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative py-4 px-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">选择自取时间</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">请选择您预计到店自提的时间点</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTimeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Direct Time Slots List */}
            <div className="flex-1 bg-white overflow-y-auto no-scrollbar divide-y divide-gray-100 px-5 py-2 min-h-[300px] max-h-[460px]">
              {availableTimeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <div
                    key={slot}
                    onClick={() => {
                      setSelectedTimeSlot(slot);
                      setIsTimeModalOpen(false);
                    }}
                    className={`py-3.5 flex items-center justify-between cursor-pointer group hover:bg-emerald-50/50 -mx-5 px-5 transition ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <span
                      className={`text-sm font-mono ${
                        isSelected
                          ? 'font-black text-[#00B578]'
                          : 'font-medium text-gray-800 group-hover:text-[#00B578]'
                      }`}
                    >
                      {slot}
                    </span>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#00B578] flex items-center justify-center text-white shadow-xs">
                        <svg
                          className="w-3 h-3 stroke-current stroke-3"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-gray-200 rounded-full group-hover:border-[#00B578]/50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

