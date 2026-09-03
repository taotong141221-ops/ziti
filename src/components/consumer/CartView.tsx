import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { CartItem, MerchantConfig } from '../../types';

interface CartViewProps {
  merchants: MerchantConfig[];
  cartItems: CartItem[];
  onUpdateQuantity: (skuId: string, delta: number) => void;
  onRemoveItem: (skuId: string) => void;
  onClearMerchant: (merchantId: string) => void;
  onClearAll: () => void;
  onGoToStore: (merchant: MerchantConfig) => void;
  onGoToHome: () => void;
  onCheckout: (merchant: MerchantConfig, itemsToCheckout: CartItem[]) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  merchants,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearMerchant,
  onClearAll,
  onGoToStore,
  onGoToHome,
  onCheckout,
}) => {
  // 选中的 SKU IDs (默认全选)
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>(() =>
    cartItems.map((item) => item.skuId)
  );

  // 购物车发生变动时保持选中项同步，新加商品默认选中
  useEffect(() => {
    setSelectedSkuIds((prev) => {
      const currentIds = cartItems.map((i) => i.skuId);
      if (currentIds.length === 0) return [];
      const validPrev = prev.filter((id) => currentIds.includes(id));
      const newlyAdded = currentIds.filter((id) => !prev.includes(id));
      if (validPrev.length === 0 && newlyAdded.length === 0) {
        return currentIds;
      }
      return [...validPrev, ...newlyAdded];
    });
  }, [cartItems]);

  // 是否处于批量管理模式
  const [isManageMode, setIsManageMode] = useState<boolean>(false);

  // 清空确认弹窗状态
  const [confirmClearType, setConfirmClearType] = useState<{
    type: 'all' | 'merchant';
    merchantId?: string;
    merchantName?: string;
  } | null>(null);

  // 按商户分组购物车商品
  const groupedCart = useMemo(() => {
    const map = new Map<string, { merchant: MerchantConfig; items: CartItem[] }>();

    cartItems.forEach((item) => {
      let group = map.get(item.merchantId);
      if (!group) {
        const foundMerchant = merchants.find((m) => m.merchantId === item.merchantId) || {
          merchantId: item.merchantId,
          name: '社区品质合作店',
          logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
          category: '社区便利',
          rating: 4.9,
          monthlySales: 1000,
          distanceKm: 0.3,
          auditStatus: 'approved' as const,
          pickupAddress: '南昌市红谷滩区绿茵路128号',
          pickupLocation: { lng: 115.862, lat: 28.683 },
          businessHours: '08:00 - 22:00',
          phone: '13879123456',
          deliveryEnabled: true,
          deliveryRadiusKm: 3.0,
          deliveryFeeMode: 'fixed' as const,
          deliveryFeeRule: { mode: 'fixed' as const, fixedFee: 3.0 },
          minOrderAmount: 15.0,
          freeFeeThreshold: 39.0,
          isOpen: true,
        };
        group = { merchant: foundMerchant, items: [] };
        map.set(item.merchantId, group);
      }
      group.items.push(item);
    });

    return Array.from(map.values());
  }, [cartItems, merchants]);

  // 全部 SKU ID 列表
  const allSkuIds = useMemo(() => cartItems.map((i) => i.skuId), [cartItems]);

  // 全选状态
  const isAllSelected = allSkuIds.length > 0 && selectedSkuIds.length === allSkuIds.length;

  // 切换全选
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSkuIds([]);
    } else {
      setSelectedSkuIds([...allSkuIds]);
    }
  };

  // 切换单品选择
  const handleToggleSelectItem = (skuId: string) => {
    setSelectedSkuIds((prev) =>
      prev.includes(skuId) ? prev.filter((id) => id !== skuId) : [...prev, skuId]
    );
  };

  // 切换商户全选
  const handleToggleMerchantSelect = (items: CartItem[]) => {
    const merchantSkuIds = items.map((i) => i.skuId);
    const allInMerchantSelected = merchantSkuIds.every((id) => selectedSkuIds.includes(id));

    if (allInMerchantSelected) {
      // 取消该商户全部
      setSelectedSkuIds((prev) => prev.filter((id) => !merchantSkuIds.includes(id)));
    } else {
      // 选中该商户全部
      setSelectedSkuIds((prev) => Array.from(new Set([...prev, ...merchantSkuIds])));
    }
  };

  // 计算选中的商品
  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => selectedSkuIds.includes(item.skuId));
  }, [cartItems, selectedSkuIds]);

  // 选中总件数
  const totalSelectedCount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedCartItems]);

  // 选中总金额
  const totalSelectedAmount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedCartItems]);

  // 选中的商户分布
  const selectedMerchantsMap = useMemo(() => {
    const map = new Map<string, { merchant: MerchantConfig; items: CartItem[] }>();
    selectedCartItems.forEach((item) => {
      let g = map.get(item.merchantId);
      if (!g) {
        const m = merchants.find((merchant) => merchant.merchantId === item.merchantId) || {
          merchantId: item.merchantId,
          name: '社区精选商户',
          logo: item.image,
          category: '品质百货',
          rating: 5.0,
          monthlySales: 800,
          distanceKm: 0.5,
          auditStatus: 'approved' as const,
          pickupAddress: '社区服务点',
          pickupLocation: { lng: 115.86, lat: 28.68 },
          businessHours: '08:00 - 22:00',
          phone: '13800000000',
          deliveryEnabled: true,
          deliveryRadiusKm: 3.0,
          deliveryFeeMode: 'fixed' as const,
          deliveryFeeRule: { mode: 'fixed' as const, fixedFee: 3.0 },
          minOrderAmount: 15.0,
          freeFeeThreshold: 39.0,
        };
        g = { merchant: m, items: [] };
        map.set(item.merchantId, g);
      }
      g.items.push(item);
    });
    return Array.from(map.values());
  }, [selectedCartItems, merchants]);

  // 批量删除已选商品
  const handleDeleteSelected = () => {
    if (selectedSkuIds.length === 0) return;
    selectedSkuIds.forEach((skuId) => {
      onRemoveItem(skuId);
    });
    setSelectedSkuIds([]);
  };

  // 触发去结算：直接跳转到确认订单，支持多商户商品展示在同一个页面中
  const handleProceedCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert('请先勾选需要结算的商品！');
      return;
    }

    // 默认传入首个商户或代表商户，同时把全部勾选的多商户商品 selectedCartItems 传入
    const primaryMerchant = selectedMerchantsMap[0]?.merchant || merchants[0];
    onCheckout(primaryMerchant, selectedCartItems);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F7FA]">
      {/* Top Header Bar */}
      <div className="shrink-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black text-gray-900">购物车</span>
              {cartItems.length > 0 && (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                  共 {cartItems.reduce((sum, i) => sum + i.quantity, 0)} 件商品
                </span>
              )}
            </div>
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                isManageMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              id="btn-cart-manage"
            >
              {isManageMode ? '完成' : '编辑'}
            </button>
          </div>
        )}
      </div>

      {/* Cart Content: Empty State or Grouped List (可滚动区域) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 pb-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center text-gray-300 shadow-inner border border-gray-100">
              <ShoppingCart className="w-12 h-12 text-gray-300 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-800">购物车空空如也</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                快去商圈挑选新鲜果蔬、生活好物和热气腾腾的美食吧！
              </p>
            </div>
            <button
              onClick={onGoToHome}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00B578] to-[#009E68] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center space-x-1.5"
              id="btn-cart-go-home"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>去商圈逛逛</span>
            </button>
          </div>
        ) : (
          groupedCart.map(({ merchant, items }) => {
            const merchantSkuIds = items.map((i) => i.skuId);
            const isMerchantAllSelected = merchantSkuIds.every((id) =>
              selectedSkuIds.includes(id)
            );
            const merchantSelectedItems = items.filter((i) => selectedSkuIds.includes(i.skuId));
            const merchantSubtotal = merchantSelectedItems.reduce(
              (s, i) => s + i.price * i.quantity,
              0
            );

            // 免运费进度
            const isFreeDelivery =
              merchant.freeFeeThreshold && merchantSubtotal >= merchant.freeFeeThreshold;
            const diffToFree = merchant.freeFeeThreshold
              ? Math.max(0, Number((merchant.freeFeeThreshold - merchantSubtotal).toFixed(2)))
              : 0;

            return (
              <div
                key={merchant.merchantId}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition"
              >
                {/* 商户分组头部 */}
                <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    {/* 店铺全选勾选框 */}
                    <button
                      onClick={() => handleToggleMerchantSelect(items)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition border cursor-pointer ${
                        isMerchantAllSelected
                          ? 'bg-[#00B578] border-[#00B578] text-white shadow-xs'
                          : 'bg-white border-gray-300 text-transparent hover:border-emerald-500'
                      }`}
                      id={`chk-merchant-${merchant.merchantId}`}
                      title={isMerchantAllSelected ? '取消全选本店' : '全选本店商品'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* 商户信息与进店 */}
                    <div
                      onClick={() => onGoToStore(merchant)}
                      className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer group"
                    >
                      <img
                        src={merchant.logo}
                        alt={merchant.name}
                        className="w-6 h-6 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                      />
                      <div className="flex items-center space-x-1 min-w-0">
                        <span className="text-xs font-black text-gray-900 truncate group-hover:text-emerald-700 transition">
                          {merchant.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* 清空本店按钮 */}
                  <button
                    onClick={() =>
                      setConfirmClearType({
                        type: 'merchant',
                        merchantId: merchant.merchantId,
                        merchantName: merchant.name,
                      })
                    }
                    className="text-[11px] text-gray-400 hover:text-rose-500 p-1 flex items-center space-x-0.5 cursor-pointer"
                    title="清空本店商品"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="text-[10px]">清空</span>
                  </button>
                </div>

                {/* 配送费门槛/满免提示 */}
                {merchant.deliveryEnabled && merchant.freeFeeThreshold && (
                  <div className="px-3.5 py-1.5 bg-emerald-50/40 border-b border-emerald-50 flex items-center justify-between text-[10px] text-emerald-800">
                    <div className="flex items-center space-x-1">
                      <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                      {isFreeDelivery ? (
                        <span className="font-bold text-emerald-700">已享本店满额免配送费！</span>
                      ) : (
                        <span>
                          同城配满 ¥{merchant.freeFeeThreshold} 免运费
                          {merchantSubtotal > 0 && (
                            <span className="text-rose-600 font-bold ml-1">
                              (还差 ¥{diffToFree.toFixed(2)})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] bg-white text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                      支持自提 / 专送
                    </span>
                  </div>
                )}

                {/* 商品列表项 */}
                <div className="divide-y divide-gray-50 p-2 space-y-2">
                  {items.map((item) => {
                    const isSelected = selectedSkuIds.includes(item.skuId);

                    return (
                      <div
                        key={item.skuId}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl transition ${
                          isSelected ? 'bg-white' : 'bg-gray-50/40 opacity-80'
                        }`}
                      >
                        {/* 单品勾选框 */}
                        <button
                          onClick={() => handleToggleSelectItem(item.skuId)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition border shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-[#00B578] border-[#00B578] text-white shadow-xs'
                              : 'bg-white border-gray-300 text-transparent hover:border-emerald-500'
                          }`}
                          id={`chk-item-${item.skuId}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* 商品图片 */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0 shadow-2xs"
                        />

                        {/* 商品主信息 */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-gray-900 truncate leading-snug">
                              {item.title}
                            </h4>
                            <div className="inline-block bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium max-w-full truncate">
                              规格: {item.specDesc}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1.5">
                            {/* 价格展示 */}
                            <div className="flex items-baseline space-x-1">
                              <span className="text-xs font-black text-rose-600 font-mono">
                                ¥<span className="text-sm">{item.price.toFixed(2)}</span>
                              </span>
                            </div>

                            {/* 数量增减控制器与单品删除 */}
                            <div className="flex items-center space-x-1.5">
                              {/* 步进器 */}
                              <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200 shadow-2xs">
                                <button
                                  onClick={() => onUpdateQuantity(item.skuId, -1)}
                                  className="w-5 h-5 rounded-md bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 transition shadow-xs cursor-pointer"
                                  title="减少数量"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-black text-gray-900 w-6 text-center font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.skuId, 1)}
                                  className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                                  title="增加数量"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* 单品直接删除按钮 */}
                              <button
                                onClick={() => onRemoveItem(item.skuId)}
                                className="p-1 text-gray-300 hover:text-rose-500 transition cursor-pointer"
                                title="删除该商品"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar (吸底结算栏，完全固定在底部) */}
      {cartItems.length > 0 && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-2.5 z-20 shadow-lg flex items-center justify-between">
          {/* 左侧全选 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleSelectAll}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition border cursor-pointer ${
                isAllSelected
                  ? 'bg-[#00B578] border-[#00B578] text-white shadow-xs'
                  : 'bg-white border-gray-300 text-transparent hover:border-emerald-500'
              }`}
              id="chk-cart-select-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="text-xs font-bold text-gray-700 select-none">全选</span>
          </div>

          {/* 右侧：正常模式结算 / 管理模式批量删除 */}
          {isManageMode ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setConfirmClearType({ type: 'all' })}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                一键清空
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedSkuIds.length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                  selectedSkuIds.length > 0
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                id="btn-cart-batch-delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除所选 ({totalSelectedCount})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* 合计金额 */}
              <div className="text-right">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs text-gray-500">合计:</span>
                  <span className="text-xs font-black text-rose-600 font-mono">
                    ¥<span className="text-base">{totalSelectedAmount.toFixed(2)}</span>
                  </span>
                </div>
                <div className="text-[9px] text-gray-400">
                  {selectedMerchantsMap.length > 1
                    ? `包含 ${selectedMerchantsMap.length} 家商户`
                    : '支持抵扣积分/消费金'}
                </div>
              </div>

              {/* 结算主按钮 */}
              <button
                onClick={handleProceedCheckout}
                disabled={totalSelectedCount === 0}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer ${
                  totalSelectedCount > 0
                    ? 'bg-gradient-to-r from-[#00B578] to-[#009E68] hover:from-[#009E68] hover:to-[#00875A] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                id="btn-cart-checkout"
              >
                <span>去结算 ({totalSelectedCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 清空确认弹窗 */}
      {confirmClearType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-black text-gray-900">
                {confirmClearType.type === 'all' ? '清空全部购物车' : '清空店铺商品'}
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {confirmClearType.type === 'all'
                ? '确定要清空购物车中的所有商品吗？此操作无法撤销。'
                : `确定要清空来自「${confirmClearType.merchantName}」的所有商品吗？`}
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setConfirmClearType(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (confirmClearType.type === 'all') {
                    onClearAll();
                  } else if (confirmClearType.merchantId) {
                    onClearMerchant(confirmClearType.merchantId);
                  }
                  setConfirmClearType(null);
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

