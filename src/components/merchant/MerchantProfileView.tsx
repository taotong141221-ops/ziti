import React, { useState } from 'react';
import {
  Bell,
  Edit2,
  ChevronRight,
  QrCode,
  Users,
  Store,
  CreditCard,
  Headphones,
  Share2,
  Lock,
  LogOut,
  X,
  Copy,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Camera,
  RotateCcw,
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  Plus,
  Gift,
  Percent,
  Timer,
  Navigation,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MerchantConfig } from '../../types';

interface MerchantProfileViewProps {
  merchant: MerchantConfig;
  onUpdateMerchant: (updated: MerchantConfig) => void;
  onGoToBankCards: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const MerchantProfileView: React.FC<MerchantProfileViewProps> = ({
  merchant,
  onUpdateMerchant,
  onGoToBankCards,
  onLogout,
  onShowToast,
}) => {
  // Modal states
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Active Subpage State ('none' | 'pickup')
  const [activeSubPage, setActiveSubPage] = useState<'none' | 'pickup'>('none');

  // Pickup Settings State
  const [pickupAddress, setPickupAddress] = useState<string>(
    merchant.pickupAddress || '红谷滩区绿茵路88号临街商铺 (老街坊生鲜大厅服务台)'
  );
  const [pickupTimeSlots, setPickupTimeSlots] = useState<string>(
    merchant.pickupTimeSlots || merchant.businessHours || '08:00 - 22:00'
  );
  const [pickupPhone, setPickupPhone] = useState<string>(
    merchant.phone || '13870011223'
  );
  const [pickupExpiryDesc, setPickupExpiryDesc] = useState<string>(
    merchant.pickupExpiryDesc || '下单后48小时内有效'
  );
  const [pickupExpiryHours, setPickupExpiryHours] = useState<number>(
    merchant.pickupExpiryHours || 48
  );
  const [pickupOverdueFeeRate, setPickupOverdueFeeRate] = useState<number>(
    merchant.pickupOverdueFeeRate ?? 10
  );
  const [pickupPrepTimeMinutes, setPickupPrepTimeMinutes] = useState<number>(
    merchant.pickupPrepTimeMinutes ?? 15
  );
  const [pickupAdvanceDays, setPickupAdvanceDays] = useState<number>(
    merchant.pickupAdvanceDays ?? 1
  );
  const [pickupAutoPrintReceipt, setPickupAutoPrintReceipt] = useState<boolean>(
    merchant.pickupAutoPrintReceipt ?? true
  );

  const [isOpen, setIsOpen] = useState<boolean>(merchant.isOpen !== false);

  const toggleOpenStatus = () => {
    const next = !isOpen;
    setIsOpen(next);
    onUpdateMerchant({
      ...merchant,
      isOpen: next,
    });
    onShowToast(`店铺营业状态已切换为: ${next ? '营业中' : '休息中'}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`已复制${label}到剪贴板！`);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      onShowToast('新密码长度不能少于6位');
      return;
    }
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    onShowToast('登录密码修改成功！');
  };

  // Save Pickup Settings
  const handleSavePickupSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim()) {
      onShowToast('请输入门店自提地址');
      return;
    }
    if (!pickupTimeSlots.trim()) {
      onShowToast('请输入自提营业时段');
      return;
    }
    onUpdateMerchant({
      ...merchant,
      pickupAddress: pickupAddress.trim(),
      pickupTimeSlots: pickupTimeSlots.trim(),
      phone: pickupPhone.trim(),
      pickupExpiryHours,
      pickupExpiryDesc: pickupExpiryDesc.trim(),
      pickupOverdueFeeRate,
      pickupPrepTimeMinutes,
      pickupAdvanceDays,
      pickupAutoPrintReceipt,
    });
    setActiveSubPage('none');
    onShowToast('自提设置与履约规则已成功保存！');
  };

  // ================= SUBPAGE: 自提设置 =================
  if (activeSubPage === 'pickup') {
    return (
      <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-y-auto no-scrollbar relative">
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveSubPage('none')}
              className="p-1.5 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
              id="btn-back-from-pickup"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00B578] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-black text-gray-900">自提设置</h2>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">履约与售后规则配置</span>
        </div>

        {/* Subpage Content Form */}
        <form onSubmit={handleSavePickupSettings} className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* 规则一：门店自提具体地址与提货联系电话 (原规则五置顶) */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/90 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#00B578]" />
                  <span className="text-xs font-black text-gray-900">规则一：门店自提地址与联系方式</span>
                </div>
                <span className="text-[10px] text-rose-500 font-bold">* 必填信息</span>
              </div>

              {/* 门店自提地址 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700">
                  门店自提具体地址及提货方位指引 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="如: 红谷滩区绿茵路88号临街商铺 (老街坊生鲜大厅服务台)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#00B578] focus:bg-white text-gray-800 transition"
                />
              </div>

              {/* 门店自提联系电话 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                  <span>门店自提热线 / 备货联系电话</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  placeholder="如: 13870011223"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] font-sans font-bold text-gray-900"
                />
                <p className="text-[10px] text-gray-400">
                  用于顾客自提订单凭证展示及提货联系。
                </p>
              </div>
            </div>

            {/* 规则二：自提营业与顾客预约规则 */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/90 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-[#00B578]" />
                  <span className="text-xs font-black text-gray-900">规则二：自提营业与预约规则</span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                  预约时间控制
                </span>
              </div>

              {/* 2.1 自提营业时段 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                  <span>每日自提营业时段</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupTimeSlots}
                  onChange={(e) => setPickupTimeSlots(e.target.value)}
                  placeholder="如: 08:00 - 22:00"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] font-bold text-gray-900"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['08:00 - 22:00', '07:30 - 21:30', '09:00 - 23:00', '全天24小时可提'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPickupTimeSlots(preset)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                        pickupTimeSlots === preset
                          ? 'bg-[#00B578] text-white font-bold'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2.2 最短备货耗时 (分钟) */}
              <div className="space-y-1.5 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-700">
                    最短备货制作时长
                  </label>
                  <span className="text-emerald-700 font-bold font-mono text-[11px]">
                    {pickupPrepTimeMinutes === 0 ? '即来即提 (0分钟)' : `${pickupPrepTimeMinutes} 分钟`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { minutes: 0, label: '即来即提' },
                    { minutes: 15, label: '15分钟' },
                    { minutes: 30, label: '30分钟' },
                    { minutes: 45, label: '45分钟' },
                    { minutes: 60, label: '60分钟' },
                  ].map((item) => (
                    <button
                      key={item.minutes}
                      type="button"
                      onClick={() => setPickupPrepTimeMinutes(item.minutes)}
                      className={`py-1.5 rounded-xl text-[10px] text-center font-bold border transition cursor-pointer ${
                        pickupPrepTimeMinutes === item.minutes
                          ? 'bg-emerald-50 border-[#00B578] text-[#00B578] shadow-2xs'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2.3 最长可预约天数 */}
              <div className="space-y-1.5 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-700">
                    预约跨度范围
                  </label>
                  <span className="text-gray-500 text-[11px]">
                    {pickupAdvanceDays === 1 ? '仅限当天预约自提' : `支持未来 ${pickupAdvanceDays} 天内预约`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 1, label: '仅限当天自提' },
                    { days: 2, label: '支持预约明天 (2天)' },
                    { days: 3, label: '支持预约3天内' },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setPickupAdvanceDays(d.days)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition cursor-pointer text-center ${
                        pickupAdvanceDays === d.days
                          ? 'bg-emerald-50 border-[#00B578] text-[#00B578]'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 规则三：自提凭证与有效期规则 (原规则二，已移除灰色提示框) */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/90 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Timer className="w-4 h-4 text-[#00B578]" />
                  <span className="text-xs font-black text-gray-900">规则三：自提凭证与时效规则</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">6位核销凭证</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700">
                  自提凭证有效期说明 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupExpiryDesc}
                  onChange={(e) => setPickupExpiryDesc(e.target.value)}
                  placeholder="如: 下单后48小时内有效"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00B578] font-bold text-gray-900"
                />
              </div>

              {/* 快捷时效预设 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 block">常用时效预设:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { desc: '下单当日营业结束前有效', hours: 16 },
                    { desc: '下单后24小时内有效', hours: 24 },
                    { desc: '下单后48小时内有效', hours: 48 },
                    { desc: '下单后72小时内有效', hours: 72 },
                  ].map((preset) => (
                    <button
                      key={preset.desc}
                      type="button"
                      onClick={() => {
                        setPickupExpiryDesc(preset.desc);
                        setPickupExpiryHours(preset.hours);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                        pickupExpiryDesc === preset.desc
                          ? 'bg-[#00B578] text-white font-bold'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {preset.desc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 规则四：超时未提与售后退款规则 (原规则三，已移除黄绿卡片与试算示例) */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-gray-900">规则四：超时未提与售后退款规则</span>
                </div>
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  服务费扣除配置
                </span>
              </div>

              {/* 扣除比例配置 */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="font-bold text-gray-700">超时未提退款扣除比例</label>
                  <span className="text-amber-600 font-black font-mono text-xs">{pickupOverdueFeeRate}%</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    required
                    value={pickupOverdueFeeRate}
                    onChange={(e) => setPickupOverdueFeeRate(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-amber-500 font-sans font-black text-amber-800"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 sticky bottom-0 bg-[#F5F7FA] pb-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-sm rounded-2xl shadow-md transition cursor-pointer text-center"
              id="btn-submit-pickup-settings"
            >
              保存自提设置与履约规则
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-y-auto no-scrollbar relative">
      {/* Top Nature Leaves Mint Gradient Header (1:1 with Screenshot 1 Right) */}
      <div className="bg-gradient-to-b from-[#DCF4EC] via-[#E8F8F2] to-[#F5F7FA] px-4 pt-3 pb-2 shrink-0 relative overflow-hidden">
        {/* Subtle decorative leaf pattern watermark */}
        <div className="absolute top-0 right-0 w-44 h-44 opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30,120 Q80,20 180,40 Q150,140 30,120 Z"
              fill="#00B578"
            />
            <path
              d="M10,80 Q90,30 160,90 Q120,160 10,80 Z"
              fill="#26A69A"
            />
          </svg>
        </div>

        {/* Store Profile Info Card */}
        <div className="flex items-center justify-between relative z-10 pt-1 pb-3">
          <div className="flex items-center space-x-3">
            {/* Store Avatar with edit pencil badge */}
            <div className="relative">
              <img
                src={merchant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80'}
                alt={merchant.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => onShowToast('请在“商户管理-店铺装修”中更换门头与环境照片')}
                className="absolute bottom-0 right-0 w-5 h-5 bg-white text-gray-700 rounded-full flex items-center justify-center shadow-xs border border-gray-200 cursor-pointer"
                title="修改头像"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Store Name, Category & Code */}
            <div>
              <h1 className="text-base font-black text-gray-900 tracking-tight">
                {merchant.name || '老街坊牛肉面馆'}
              </h1>
              <div className="mt-1">
                <span className="bg-[#FFF3EC] text-[#FF9800] text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                  {merchant.category || '餐饮美食'}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono mt-1 block">
                编号：{merchant.merchantCode || '56952563'}
              </span>
            </div>
          </div>

          {/* Notification Bell with red badge */}
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-full hover:bg-white/60 text-gray-700 relative transition cursor-pointer"
            id="btn-merchant-notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>
        </div>

        {/* Revenue & Stats Card (1:1 with Screenshot 1 Right) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/90 relative z-10 space-y-3">
          {/* Top Big Stat: 累计营业额 > */}
          <div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
              <span>累计营业额</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-sm font-black text-gray-900">¥</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight font-sans">
                {(merchant.totalRevenue || 15060.02).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 3 Columns Sub Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
            {/* Col 1 */}
            <div>
              <div className="flex items-center space-x-0.5 text-[11px] text-gray-400 font-medium">
                <span className="truncate">累计关联收益</span>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
              </div>
              <div className="mt-1 flex items-baseline space-x-0.5">
                <span className="text-xs font-bold text-gray-900">¥</span>
                <span className="text-sm font-black text-gray-900 font-sans">
                  {(merchant.associatedIncome || 1560.02).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-0.5 text-[11px] text-gray-400 font-medium">
                <span>拓展商户</span>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
              </div>
              <div className="mt-1 flex items-baseline justify-center space-x-0.5">
                <span className="text-sm font-black text-gray-900 font-sans">
                  {merchant.expandedMerchantsCount || 12}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">家</span>
              </div>
            </div>

            {/* Col 3 */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-0.5 text-[11px] text-gray-400 font-medium">
                <span className="truncate">累计推荐收益</span>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
              </div>
              <div className="mt-1 flex items-baseline justify-end space-x-0.5">
                <span className="text-xs font-bold text-gray-900">¥</span>
                <span className="text-sm font-black text-gray-900 font-sans">
                  {(merchant.referralIncome || 150.0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pt-3 pb-24 space-y-3.5">
        {/* 2 Action Cards Grid (1:1 with Screenshot 1 Right) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: 收款二维码 */}
          <div
            onClick={() => setShowQrModal(true)}
            className="bg-gradient-to-r from-[#EEF5FE] to-[#F5F8FF] rounded-2xl p-3.5 border border-[#DCE9FA] flex items-center justify-between shadow-2xs hover:shadow-xs transition cursor-pointer"
            id="card-merchant-qrcode"
          >
            <div>
              <h3 className="text-xs font-black text-gray-900">收款二维码</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">店铺收款二维码</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DDECFF] text-[#2B7FFF] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: 推荐商户入驻 */}
          <div
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-[#EEF5FE] to-[#F5F8FF] rounded-2xl p-3.5 border border-[#DCE9FA] flex items-center justify-between shadow-2xs hover:shadow-xs transition cursor-pointer"
            id="card-merchant-invite"
          >
            <div>
              <h3 className="text-xs font-black text-gray-900">推荐商户入驻</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">推荐商家入驻二维码</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DDECFF] text-[#2B7FFF] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Menu List Card (1:1 with Screenshot 1 Right + Subpage Entries) */}
        <div className="bg-white rounded-2xl p-1 shadow-2xs border border-gray-100 divide-y divide-gray-50">
          {/* Row 1: 营业状态 */}
          <div
            onClick={toggleOpenStatus}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-status"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#FF4D4F] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">营业状态</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOpen
                    ? 'bg-[#FFF0F0] text-[#FF4D4F] border border-[#FFD0D0]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isOpen ? '营业中' : '休息中'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Row 2: 自提设置 */}
          <div
            onClick={() => setActiveSubPage('pickup')}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-pickup-settings"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B578] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">自提设置</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Row 4: 我的银行卡 */}
          <div
            onClick={onGoToBankCards}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-bankcards"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B578] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">我的银行卡</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Row 5: 在线客服 */}
          <div
            onClick={() => setShowServiceModal(true)}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-service"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1890FF] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">在线客服</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Row 6: 分享 */}
          <div
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-share"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#FA8C16] flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">分享</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Row 7: 修改登录密码 */}
          <div
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
            id="menu-merchant-password"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#AD8B00] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">修改登录密码</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Logout Button (1:1 with Screenshot 1 Right) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-500 font-medium text-xs rounded-2xl shadow-2xs border border-gray-100 transition cursor-pointer text-center"
            id="btn-merchant-logout"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. 收款二维码 Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-black text-sm text-gray-900">店铺收款码</span>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-gray-100 flex flex-col items-center space-y-3">
                <div className="text-xs font-black text-gray-800">
                  {merchant.name}
                </div>
                <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100">
                  {/* SVG Simulated QR Code */}
                  <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="24" height="24" fill="#111827" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#00B578" />

                    <rect x="66" y="10" width="24" height="24" fill="#111827" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#00B578" />

                    <rect x="10" y="66" width="24" height="24" fill="#111827" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#00B578" />

                    {/* QR pattern cells */}
                    <rect x="42" y="14" width="6" height="6" fill="#111827" />
                    <rect x="52" y="20" width="6" height="6" fill="#111827" />
                    <rect x="42" y="30" width="6" height="6" fill="#111827" />
                    <rect x="20" y="44" width="6" height="6" fill="#111827" />
                    <rect x="30" y="44" width="6" height="6" fill="#00B578" />
                    <rect x="40" y="44" width="6" height="6" fill="#111827" />
                    <rect x="50" y="44" width="6" height="6" fill="#111827" />
                    <rect x="60" y="44" width="6" height="6" fill="#00B578" />
                    <rect x="70" y="44" width="6" height="6" fill="#111827" />
                    <rect x="44" y="60" width="6" height="6" fill="#111827" />
                    <rect x="54" y="70" width="6" height="6" fill="#00B578" />
                    <rect x="64" y="80" width="6" height="6" fill="#111827" />
                    <rect x="74" y="70" width="6" height="6" fill="#111827" />
                    <rect x="84" y="80" width="6" height="6" fill="#111827" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400">
                  顾客使用微信/社区小程序扫码即可直接买单
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  onShowToast('收款码已保存至本地相册！');
                }}
                className="w-full py-2.5 bg-[#00B578] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                保存收款码到相册
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. 推荐商户入驻 Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-black text-sm text-gray-900">推荐商家入驻</span>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F0F7FF] p-4 rounded-2xl border border-blue-100 flex flex-col items-center space-y-2.5">
                <div className="text-xs font-black text-blue-950">
                  扫码成为社区合伙商家
                </div>
                <p className="text-[10px] text-blue-700/80">
                  成功推荐入驻即可享累计推荐收益分润
                </p>
                <div className="p-3 bg-white rounded-xl shadow-xs border border-blue-100">
                  <QrCode className="w-32 h-32 text-blue-600" />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  推荐人编码：{merchant.merchantCode || '56952563'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  onShowToast('推荐邀请海报已生成并保存！');
                }}
                className="w-full py-2.5 bg-[#1890FF] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                生成专属邀请海报
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. 消息通知 Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <span>商家通知中心 (3)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {[
                  {
                    title: '新订单付款成功通知',
                    time: '10分钟前',
                    desc: '顾客张树鹏已成功支付订单 NO:1000111，实付 ¥10.00。',
                  },
                  {
                    title: '让利分账收益到账',
                    time: '今天 01:38',
                    desc: '您的商户账户已入账关联收益 ¥15.60，可前往账户提现。',
                  },
                  {
                    title: '平台食品安全合规周检提示',
                    time: '昨天 18:00',
                    desc: '请及时在商户管理中完善门头及店内环境照片并更新营业时间。',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1 border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{item.title}</span>
                      <span className="text-[10px] text-gray-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. 在线客服 Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-black text-sm text-gray-900">商户专属客服</span>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Headphones className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">
                  平台商户运营经理：7x24h 响应
                </h4>
                <p className="text-[11px] text-gray-500">
                  客服专线：400-880-9988
                  <br />
                  微信客服：sj_service_vip
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCopy('400-880-9988', '客服电话');
                  setShowServiceModal(false);
                }}
                className="w-full py-2.5 bg-[#1890FF] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                复制客服电话
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. 分享 Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-black text-sm text-gray-900">分享店铺</span>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600">
                将【{merchant.name}】分享至微信群或朋友圈，吸引更多周边居民下单！
              </p>

              <button
                type="button"
                onClick={() => {
                  handleCopy(
                    `【${merchant.name}】精选热食美味，社区自提与极速专送已上线！https://sq.mall.cn/s/${merchant.merchantId}`,
                    '店铺链接'
                  );
                  setShowShareModal(false);
                }}
                className="w-full py-2.5 bg-[#FA8C16] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制分享文案与链接</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. 修改密码 Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-black text-sm text-gray-900">修改登录密码</span>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">原密码</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入当前密码"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">新密码</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入不少于6位的新密码"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00B578] text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  保存并生效
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
