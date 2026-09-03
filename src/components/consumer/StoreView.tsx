import React, { useState } from 'react';
import { Store, MapPin, Phone, Clock, Truck, ShoppingBag, Plus, Minus, ShoppingCart, Trash2, Info, ChevronRight, AlertCircle } from 'lucide-react';
import { MerchantConfig, Product, CartItem, FulfillType } from '../../types';

interface StoreViewProps {
  merchant: MerchantConfig;
  products: Product[];
  cartItems: CartItem[];
  fulfillType: FulfillType;
  onFulfillTypeChange: (type: FulfillType) => void;
  onAddToCart: (product: Product, skuId: string, quantity?: number) => void;
  onUpdateCartQuantity: (skuId: string, delta: number) => void;
  onClearCart: (merchantId: string) => void;
  onSelectProduct: (product: Product) => void;
  onGoToCheckout: () => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  merchant,
  products,
  cartItems,
  fulfillType,
  onFulfillTypeChange,
  onAddToCart,
  onUpdateCartQuantity,
  onClearCart,
  onSelectProduct,
  onGoToCheckout,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('全部');
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  // Filter products for this merchant
  const merchantProducts = products.filter((p) => p.merchantId === merchant.merchantId && p.auditStatus === 'approved');

  // Sub categories
  const subCategories = ['全部', ...Array.from(new Set(merchantProducts.map((p) => p.categoryL2)))];

  const displayedProducts = merchantProducts.filter((p) => {
    if (selectedSubCategory === '全部') return true;
    return p.categoryL2 === selectedSubCategory;
  });

  // Calculate cart stats for this merchant
  const thisMerchantCart = cartItems.filter((c) => c.merchantId === merchant.merchantId);
  const totalCount = thisMerchantCart.reduce((sum, item) => sum + item.quantity, 0);
  const goodsAmount = thisMerchantCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery check logic per PRD
  let deliveryFee = 0;
  let isBelowMinOrder = false;
  let diffToMin = 0;
  let isFreeDelivery = false;

  if (fulfillType === 'delivery') {
    if (goodsAmount < merchant.minOrderAmount) {
      isBelowMinOrder = true;
      diffToMin = Number((merchant.minOrderAmount - goodsAmount).toFixed(2));
    }
    if (merchant.freeFeeThreshold && goodsAmount >= merchant.freeFeeThreshold) {
      isFreeDelivery = true;
      deliveryFee = 0;
    } else if (merchant.deliveryFeeMode === 'fixed') {
      deliveryFee = merchant.deliveryFeeRule.fixedFee || 3;
    } else if (merchant.deliveryFeeMode === 'ladder' && merchant.deliveryFeeRule.tiers) {
      const matched = merchant.deliveryFeeRule.tiers.find((t) => t.upto === null || goodsAmount <= t.upto);
      deliveryFee = matched ? matched.fee : 0;
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] relative overflow-hidden">
      {/* Merchant Header Card */}
      <div className="bg-white px-4 pt-2.5 pb-3 border-b border-gray-100 shadow-xs shrink-0">
        <div className="flex space-x-3 items-center">
          <img
            src={merchant.logo}
            alt={merchant.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-black text-gray-900 truncate">{merchant.name}</h2>
            </div>
            
            {/* 店铺类型 & 平台指定商户标签 */}
            <div className="flex items-center flex-wrap gap-1.5 mt-1">
              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {merchant.category}
              </span>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                平台指定商户
              </span>
              <span className="text-[10px] text-gray-500 font-medium ml-1">
                距您 {merchant.distanceKm}km
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[10px] text-gray-500 mt-1 truncate">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{merchant.pickupAddress}</span>
            </div>
          </div>
          <a
            href={`tel:${merchant.phone}`}
            className="p-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition shrink-0"
            title="拨打商家电话"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Pickup Time Slots Bar */}
        <div className="mt-2.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>营业自提时段: {merchant.businessHours || merchant.pickupTimeSlots || '09:00 - 21:00'}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded">
            门店自提
          </span>
        </div>
      </div>

      {/* Main Body: Left Category Sidebar + Right Product List */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-20 bg-gray-100/90 overflow-y-auto no-scrollbar py-2">
          {subCategories.map((subCat) => {
            const isSelected = selectedSubCategory === subCat;
            return (
              <button
                key={subCat}
                onClick={() => setSelectedSubCategory(subCat)}
                className={`w-full py-3 px-2 text-center text-xs transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-white text-emerald-700 font-black'
                    : 'text-gray-600 hover:bg-gray-200/60 font-medium'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r" />
                )}
                <span className="block truncate">{subCat}</span>
              </button>
            );
          })}
        </div>

        {/* Right Product List */}
        <div className="flex-1 bg-white overflow-y-auto no-scrollbar p-3 space-y-3 pb-24">
          <div className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-between">
            <span>{selectedSubCategory} ({displayedProducts.length})</span>
            <span className="text-[10px] text-gray-400">品质好物每日更新</span>
          </div>

          {displayedProducts.map((product) => {
            const defaultSku = product.skus[0];
            const inCart = thisMerchantCart.find((c) => c.productId === product.productId);
            const cartQty = inCart ? inCart.quantity : 0;
            const isSoldOut = defaultSku.stock - defaultSku.frozenStock <= 0;

            return (
              <div
                key={product.productId}
                className="flex space-x-3 p-2 rounded-xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition"
                id={`product-item-${product.productId}`}
              >
                {/* Product Thumbnail */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50 cursor-pointer"
                >
                  <img
                    src={product.mainImages[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-[11px] font-bold">
                      已售罄
                    </div>
                  )}
                </div>

                {/* Info & Action */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div onClick={() => onSelectProduct(product)} className="cursor-pointer">
                    <h3 className="text-xs font-bold text-gray-900 truncate leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{product.subtitle}</p>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center space-x-2">
                      <span>已售 {product.totalSold}</span>
                      <span>余量 {defaultSku.stock - defaultSku.frozenStock}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-1.5">
                    <div>
                      <span className="text-[10px] text-rose-600 font-bold">¥</span>
                      <span className="text-sm font-black text-rose-600">{defaultSku.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 line-through ml-1">
                        ¥{defaultSku.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Stepper / Add Button */}
                    {isSoldOut ? (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        补货中
                      </span>
                    ) : cartQty > 0 ? (
                      <div className="flex items-center space-x-1.5 bg-gray-50 rounded-full p-0.5 border border-gray-200">
                        <button
                          onClick={() => onUpdateCartQuantity(inCart!.skuId, -1)}
                          className="w-5 h-5 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-xs hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-4 text-center">
                          {cartQty}
                        </span>
                        <button
                          onClick={() => onAddToCart(product, defaultSku.skuId, 1)}
                          className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:bg-emerald-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product, defaultSku.skuId, 1)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition cursor-pointer flex items-center space-x-1 shadow-xs"
                        id={`btn-add-${product.productId}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>选购</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Drawer Popup */}
      {showCartDrawer && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-40 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-4 max-h-[60%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-gray-900">已选商品 (共{totalCount}件)</span>
                {fulfillType === 'delivery' && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    配送模式
                  </span>
                )}
              </div>
              <button
                onClick={() => onClearCart(merchant.merchantId)}
                className="text-xs text-gray-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空购物车</span>
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar divide-y divide-gray-50 py-2 space-y-2">
              {thisMerchantCart.map((item) => (
                <div key={item.skuId} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-800 truncate">{item.title}</div>
                      <div className="text-[10px] text-gray-400">{item.specDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-rose-600">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-1 bg-gray-50 rounded-full p-0.5 border border-gray-200">
                      <button
                        onClick={() => onUpdateCartQuantity(item.skuId, -1)}
                        className="w-5 h-5 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateCartQuantity(item.skuId, 1)}
                        className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCartDrawer(false)}
              className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Checkout Bar (Matching PRD) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2.5 z-30 shadow-lg flex items-center justify-between">
        {/* Cart Icon & Amount */}
        <div
          onClick={() => {
            if (totalCount > 0) setShowCartDrawer(!showCartDrawer);
          }}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition ${
              totalCount > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              <ShoppingCart className="w-6 h-6" />
            </div>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalCount}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xs font-bold text-gray-900">¥</span>
              <span className="text-lg font-black text-rose-600 tracking-tight">
                {goodsAmount.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              到店自提 · 0配送费
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          {totalCount === 0 ? (
            <button
              disabled
              className="px-6 py-2.5 bg-gray-200 text-gray-400 font-bold text-xs rounded-full cursor-not-allowed"
            >
              去结算
            </button>
          ) : (
            <button
              onClick={onGoToCheckout}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-md transition cursor-pointer active:scale-95"
              id="btn-goto-checkout"
            >
              去结算 ({totalCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
