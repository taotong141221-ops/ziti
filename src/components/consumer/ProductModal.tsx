import React, { useState } from 'react';
import { X, Check, ShoppingBag, Plus } from 'lucide-react';
import { Product, ProductSKU } from '../../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, skuId: string, quantity: number) => void;
  onBuyNow: (product: Product, skuId: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [selectedSkuId, setSelectedSkuId] = useState<string>(product.skus[0]?.skuId || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const currentSku: ProductSKU = product.skus.find((s) => s.skuId === selectedSkuId) || product.skus[0];
  const availableStock = currentSku ? currentSku.stock - currentSku.frozenStock : 0;
  const isSoldOut = availableStock <= 0;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl overflow-hidden max-h-[88%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header / Close button */}
        <div className="relative">
          {/* Main Image Carousel */}
          <div className="w-full h-56 bg-gray-100 relative">
            <img
              src={product.mainImages[activeImageIndex] || product.mainImages[0]}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {product.mainImages.length > 1 && (
              <div className="absolute bottom-2 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeImageIndex + 1} / {product.mainImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Specs */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5 flex-1">
          {/* Price & Sold */}
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xs font-bold text-rose-600">¥</span>
              <span className="text-2xl font-black text-rose-600 tracking-tight">
                {currentSku.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ¥{currentSku.originalPrice.toFixed(2)}
              </span>
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded">
                直降 ¥{(currentSku.originalPrice - currentSku.price).toFixed(2)}
              </span>
            </div>
            <h2 className="text-sm font-black text-gray-900 mt-1">{product.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.subtitle}</p>
          </div>

          {/* SKU Specifications */}
          <div>
            <label className="text-xs font-black text-gray-800 block mb-2">选择规格</label>
            <div className="flex flex-wrap gap-2">
              {product.skus.map((sku) => {
                const isSelected = sku.skuId === selectedSkuId;
                const skuStock = sku.stock - sku.frozenStock;
                return (
                  <button
                    key={sku.skuId}
                    onClick={() => {
                      setSelectedSkuId(sku.skuId);
                      setQuantity(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-black ring-1 ring-emerald-600'
                        : skuStock <= 0
                        ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{sku.specDesc}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <span className="text-xs font-black text-gray-800">购买数量</span>
              <span className="text-[10px] text-gray-400 ml-2">库存 {availableStock} 件</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-6 h-6 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-xs disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-bold text-gray-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 mb-1">商品介绍</h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl">
              {product.detailText}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-gray-100 flex space-x-2">
          <button
            onClick={() => {
              onAddToCart(product, currentSku.skuId, quantity);
              onClose();
            }}
            disabled={isSoldOut}
            className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-full transition cursor-pointer border border-emerald-200/80 disabled:opacity-40"
          >
            加入购物车
          </button>
          <button
            onClick={() => {
              onBuyNow(product, currentSku.skuId, quantity);
              onClose();
            }}
            disabled={isSoldOut}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-md transition cursor-pointer disabled:opacity-40"
          >
            {isSoldOut ? '已售罄' : '立即下单'}
          </button>
        </div>
      </div>
    </div>
  );
};
