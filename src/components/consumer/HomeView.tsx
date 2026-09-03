import React, { useState, useRef } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  Store,
  RefreshCw,
  ChevronRight,
  Clock,
  Bike,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';
import { MerchantConfig } from '../../types';

interface HomeViewProps {
  merchants: MerchantConfig[];
  currentLocation: string;
  onSelectMerchant: (merchant: MerchantConfig) => void;
  onOpenLocationPicker: () => void;
  onGoToCart?: () => void;
  cartCount?: number;
}

// Custom Category Icons meticulously matching reference image
const AllIndustryIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <circle cx="17" cy="17" r="7" fill="#FF4D4F" />
    <circle cx="31" cy="17" r="7" fill="#FF4D4F" />
    <circle cx="17" cy="31" r="7" fill="#FF4D4F" />
    <circle cx="31" cy="31" r="7" fill="#FF4D4F" />
  </svg>
);

const SupermarketIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path
      d="M10 12h5l4.5 18h16l4-14H18"
      stroke="#00B578"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="21" cy="35" r="2.5" fill="#00B578" />
    <circle cx="33" cy="35" r="2.5" fill="#00B578" />
  </svg>
);

const FoodBurgerIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path d="M12 21c0-6 5.5-9 12-9s12 3 12 9H12z" fill="#FF8F1F" />
    <rect x="11" y="24" width="26" height="4" rx="2" fill="#E65100" />
    <path d="M12 23h24" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 30h22c0 4-4.5 6-11 6s-11-2-11-6z" fill="#FF8F1F" />
  </svg>
);

const MedicalIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect x="12" y="14" width="24" height="24" rx="5" fill="#FF3B30" />
    <path d="M24 19v14M17 26h14" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M18 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const TobaccoIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path
      d="M24 10c7.732 0 14 6.268 14 14s-6.268 14-14 14S10 31.732 10 24s6.268-14 14-14z"
      fill="#10B981"
    />
    <path
      d="M24 15c0 5-3 8-7 11 4 0 9 2 9 8 0-6 4-8 8-9-5-1-8-5-10-10z"
      fill="#FFFFFF"
    />
  </svg>
);

const DiningClocheIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <circle cx="24" cy="15" r="2.5" fill="#EF4444" />
    <path d="M11 31c1-10 6-14 13-14s12 4 13 14H11z" fill="#EF4444" />
    <rect x="9" y="33" width="30" height="3" rx="1.5" fill="#EF4444" />
  </svg>
);

const ConvenienceStoreIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path d="M11 20h26l-3-7H14l-3 7z" fill="#F59E0B" />
    <path d="M11 20c0 2 2 3.5 4.3 3.5 2.4 0 4.3-1.5 4.3-3.5 0 2 2 3.5 4.4 3.5 2.3 0 4.3-1.5 4.3-3.5 0 2 2 3.5 4.4 3.5 2.3 0 4.3-1.5 4.3-3.5" fill="#D97706" />
    <rect x="13" y="23.5" width="22" height="13.5" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
    <rect x="20" y="27" width="8" height="10" fill="#F59E0B" rx="1" />
  </svg>
);

const FruitFreshIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path
      d="M24 16c-2.5-2.5-7-2-9 1-3 4.5-2 12.5 3 16.5 3 2.5 5.5 2.5 6 2.5s3 0 6-2.5c5-4 6-12 3-16.5-2-3-6.5-3.5-9-1z"
      fill="#EF4444"
    />
    <path d="M24 15c0-4 3-6 6-6 0 4-3 6-6 6z" fill="#10B981" />
    <path d="M24 15v-3" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ClothingDressIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path
      d="M19 12h10l3 8-4 2 6 15H14l6-15-4-2 3-8z"
      fill="#FBBF24"
    />
    <path d="M21 12a3 3 0 006 0" fill="#FFFFFF" />
  </svg>
);

const ComprehensiveIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect x="10" y="12" width="28" height="24" rx="7" fill="#3B82F6" />
    <circle cx="18" cy="24" r="2.5" fill="#FFFFFF" />
    <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
    <circle cx="30" cy="24" r="2.5" fill="#FFFFFF" />
  </svg>
);

const OtherHexagonsIcon = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <path d="M24 10l5 3v6l-5 3-5-3v-6l5-3z" fill="#10B981" />
    <path d="M17 22l5 3v6l-5 3-5-3v-6l5-3z" fill="#10B981" />
    <path d="M31 22l5 3v6l-5 3-5-3v-6l5-3z" fill="#10B981" />
  </svg>
);

export const HomeView: React.FC<HomeViewProps> = ({
  merchants,
  currentLocation,
  onSelectMerchant,
  onOpenLocationPicker,
  onGoToCart,
  cartCount = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部行业');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Screen 1: 4 columns × 2 rows = 8 icons (一次性展示 4 列，整屏滑动)
  const screen1Items = [
    // Row 1
    { name: '全部行业', icon: AllIndustryIcon },
    { name: '超市便利', icon: SupermarketIcon },
    { name: '餐饮美食', icon: FoodBurgerIcon },
    { name: '医疗', icon: MedicalIcon },
    // Row 2
    { name: '烟草', icon: TobaccoIcon },
    { name: '餐饮', icon: DiningClocheIcon },
    { name: '便利店', icon: ConvenienceStoreIcon },
    { name: '水果生鲜', icon: FruitFreshIcon },
  ];

  // Screen 2: 4 columns × 2 rows = remaining icons
  const screen2Items = [
    // Row 1
    { name: '服装', icon: ClothingDressIcon },
    { name: '综合', icon: ComprehensiveIcon },
    { name: '其他', icon: OtherHexagonsIcon },
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const pageIndex = scrollLeft > clientWidth * 0.35 ? 1 : 0;
      setCurrentScreen(pageIndex);
    }
  };

  const scrollToScreen = (screenIndex: number) => {
    if (scrollContainerRef.current) {
      const targetScroll = screenIndex * scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
      setCurrentScreen(screenIndex);
    }
  };

  // Mouse Drag handlers for 1-screen snap
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftStart.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUpOrLeave = () => {
    if (isDragging.current && scrollContainerRef.current) {
      isDragging.current = false;
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const targetScreen = scrollLeft > clientWidth * 0.35 ? 1 : 0;
      scrollToScreen(targetScreen);
    }
  };

  const filteredMerchants = merchants.filter((m) => {
    if (selectedCategory !== '全部行业') {
      if (selectedCategory === '餐饮' || selectedCategory === '餐饮美食') {
        if (m.category !== '餐饮美食' && m.category !== '餐饮') return false;
      } else if (selectedCategory === '超市便利' || selectedCategory === '便利店') {
        if (m.category !== '商超便利' && m.category !== '超市便利' && m.category !== '便利店') return false;
      } else if (selectedCategory === '水果生鲜') {
        if (m.category !== '生鲜果蔬' && m.category !== '水果生鲜') return false;
      } else if (m.category !== selectedCategory) {
        return false;
      }
    }
    if (searchKeyword.trim() && !m.name.includes(searchKeyword) && !m.category.includes(searchKeyword)) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#F8FAFC]">
      {/* 1. Top Search Bar */}
      <div className="px-3.5 pt-2 pb-1 bg-white flex items-center space-x-2">
        <div className="flex-1 bg-[#F1F5F9] rounded-full px-3.5 py-1.5 flex items-center space-x-2 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition shadow-2xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="搜索店铺名称"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            id="input-search-store"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="text-gray-400 text-xs hover:text-gray-600 shrink-0 cursor-pointer"
            >
              清空
            </button>
          )}
        </div>
        
        {/* Shopping Cart Icon */}
        <button
          onClick={() => {
            if (onGoToCart) {
              onGoToCart();
            } else {
              const target = merchants[0];
              if (target) onSelectMerchant(target);
            }
          }}
          className="relative p-2 text-gray-700 hover:text-[#00B578] hover:bg-gray-50 rounded-full transition cursor-pointer shrink-0"
          title="购物车"
          id="btn-header-cart"
        >
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white shadow-2xs">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Location Row directly below the Search Box */}
      <div className="px-4 py-2 bg-white flex items-center justify-between border-b border-gray-100 mb-2.5">
        <button
          onClick={onOpenLocationPicker}
          className="flex items-center space-x-1.5 text-gray-800 font-bold text-xs hover:opacity-80 transition cursor-pointer"
          id="btn-location-select"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[280px] text-gray-800 text-xs font-semibold">{currentLocation}</span>
          <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
        </button>
      </div>

      {/* 3. Mint Green Banner matching reference image */}
      <div className="px-3.5 mb-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#CEF5E4] via-[#B8F0D6] to-[#D5F7E9] p-3.5 text-[#065F46] shadow-xs border border-emerald-100/60">
          {/* 3D Gift Box Visual */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full bg-white/40 blur-md" />
              <div className="relative w-16 h-16 rounded-xl bg-white/90 shadow-md border border-emerald-100 flex items-center justify-center rotate-3">
                <div className="absolute inset-y-0 w-3.5 bg-gradient-to-b from-emerald-400 to-teal-500" />
                <div className="absolute inset-x-0 h-3.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                <div className="absolute -top-2 w-7 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-[210px]">
            <h3 className="text-sm font-black tracking-tight leading-tight text-[#064E3B]">
              商企联盟 消费立减
            </h3>
            <h4 className="text-sm font-black tracking-tight leading-tight text-[#064E3B] mt-0.5">
              互贸福利 分享利益
            </h4>
            <p className="text-[10px] text-[#047857] font-medium mt-1">
              分享他人或商家即可获得利益
            </p>
            <button
              onClick={() => {
                const target = merchants[0];
                if (target) onSelectMerchant(target);
              }}
              className="mt-2.5 inline-flex items-center space-x-0.5 px-2.5 py-0.5 bg-[#00B578] hover:bg-[#009e68] text-white font-bold text-[10px] rounded-full shadow-xs transition cursor-pointer"
              id="btn-banner-enter"
            >
              <span>立即推荐好友</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex justify-center items-center space-x-1 mt-2.5 pt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-2xs" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
          </div>
        </div>
      </div>

      {/* 4. 金刚区 (一次性滑动4个图标/一屏，支持滑动与指示条点击) */}
      <div className="px-3 mb-3.5 select-none">
        <div className="bg-white rounded-2xl py-3 px-1.5 shadow-2xs border border-gray-100">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            onMouseLeave={onMouseUpOrLeave}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Screen 1: 一屏4列，两行共8个图标 */}
            <div className="w-full shrink-0 snap-center px-1">
              <div className="grid grid-cols-4 gap-y-3 gap-x-1">
                {screen1Items.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
                        isSelected ? 'bg-emerald-50 scale-105' : 'hover:bg-gray-50'
                      }`}
                      id={`cat-btn-${cat.name}`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1">
                        <IconComp />
                      </div>
                      <span
                        className={`text-[11px] leading-tight ${
                          isSelected ? 'font-black text-[#00B578]' : 'text-gray-700 font-medium'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screen 2: 剩余行业图标 (4列网格) */}
            <div className="w-full shrink-0 snap-center px-1">
              <div className="grid grid-cols-4 gap-y-3 gap-x-1">
                {screen2Items.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
                        isSelected ? 'bg-emerald-50 scale-105' : 'hover:bg-gray-50'
                      }`}
                      id={`cat-btn-${cat.name}`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1">
                        <IconComp />
                      </div>
                      <span
                        className={`text-[11px] leading-tight ${
                          isSelected ? 'font-black text-[#00B578]' : 'text-gray-700 font-medium'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 指示条与滑动切换 */}
          <div className="flex items-center justify-center space-x-1.5 mt-2.5">
            <button
              onClick={() => scrollToScreen(0)}
              className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${
                currentScreen === 0 ? 'w-5 bg-emerald-500' : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              title="第一屏 (4列图标)"
            />
            <button
              onClick={() => scrollToScreen(1)}
              className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${
                currentScreen === 1 ? 'w-5 bg-emerald-500' : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              title="第二屏 (4列图标)"
            />
          </div>
        </div>
      </div>

      {/* 5. 附近商户 Section Header */}
      <div className="px-3.5 mb-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-black text-gray-900 tracking-tight">附近商户</h2>
        </div>
      </div>

      {/* 6. Merchant Cards List */}
      <div className="px-3.5 space-y-3">
        {filteredMerchants.length === 0 ? (
          <div className="bg-white rounded-2xl p-7 text-center border border-gray-100 shadow-2xs">
            <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">暂无匹配的社区商户</p>
            <p className="text-[11px] text-gray-400 mt-1">请尝试切换行业分类或搜索其他店铺</p>
            <button
              onClick={() => {
                setSelectedCategory('全部行业');
                setSearchKeyword('');
              }}
              className="mt-3 text-xs text-emerald-600 font-bold hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重置筛选</span>
            </button>
          </div>
        ) : (
          filteredMerchants.map((merchant) => (
            <div
              key={merchant.merchantId}
              onClick={() => onSelectMerchant(merchant)}
              className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs hover:shadow-xs transition cursor-pointer relative"
              id={`merchant-card-${merchant.merchantId}`}
            >
              <div className="flex space-x-3">
                {/* Store Front Image */}
                <div className="w-[84px] h-[84px] rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                  <img
                    src={merchant.logo}
                    alt={merchant.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info Block */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Title & Distance */}
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-black text-gray-900 truncate leading-snug">
                        {merchant.name}
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        {merchant.distanceKm}km
                      </span>
                    </div>

                    {/* Business Hours */}
                    <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>营业时间: {merchant.businessHours}</span>
                    </div>

                    {/* Pickup Address */}
                    <div className="flex items-center text-[10px] text-gray-500 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1 shrink-0" />
                      <span className="truncate">{merchant.pickupAddress}</span>
                    </div>
                  </div>

                  {/* Tags Row */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-[#FFF4EB] text-[#F97316] text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {merchant.category}
                      </span>
                    </div>

                    {/* 进店按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMerchant(merchant);
                      }}
                      className="px-3 py-1 bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white text-[11px] font-bold rounded-full transition cursor-pointer shadow-2xs shrink-0"
                      id={`btn-enter-${merchant.merchantId}`}
                    >
                      进店
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
