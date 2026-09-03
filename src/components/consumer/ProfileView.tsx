import React, { useState } from 'react';
import {
  MessageSquare,
  Edit3,
  ChevronRight,
  Headphones,
  Share2,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  X,
  MapPin,
  CreditCard,
  Package,
  QrCode,
  Truck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Order, DeliveryAddressItem } from '../../types';
import { OrderFilterTab } from './OrderListView';

interface ProfileViewProps {
  orders?: Order[];
  addresses?: DeliveryAddressItem[];
  onGoToOrders: (tab?: OrderFilterTab) => void;
  onGoToAddresses: () => void;
  onSwitchToMerchantRole: () => void;
  onOpenRoleSwitchModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  orders = [],
  addresses = [],
  onGoToOrders,
  onGoToAddresses,
  onSwitchToMerchantRole,
  onOpenRoleSwitchModal,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [userName, setUserName] = useState('Ella');
  const [userPhone, setUserPhone] = useState('13725655698');
  const [copied, setCopied] = useState(false);

  // Compute status badge counts for quick order entries
  const pendingPayCount = orders.filter((o) => o.orderStatus === 'pending_pay').length;
  const preparingCount = orders.filter((o) => ['pending_accept', 'picking'].includes(o.orderStatus)).length;
  const readyCount = orders.filter((o) => ['ready_pickup', 'ready_delivery'].includes(o.orderStatus)).length;
  const deliveringCount = orders.filter((o) => ['delivering', 'delivered'].includes(o.orderStatus)).length;
  const aftersaleCount = orders.filter((o) => ['aftersale', 'refunded'].includes(o.orderStatus)).length;

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar pb-24 p-3.5 space-y-3.5">
      {/* 1. Top User Profile Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center space-x-3">
          {/* Avatar with edit pencil on the bottom right corner */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80"
                alt={userName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* 头像右下角编辑图标 */}
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-200 p-1 rounded-full shadow-md text-gray-700 hover:text-emerald-600 transition cursor-pointer hover:scale-110 active:scale-95"
              title="编辑个人资料"
              id="btn-avatar-edit"
            >
              <Edit3 className="w-3 h-3 text-gray-700" />
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-black text-gray-900">{userName}</h2>
              {/* 买家标签改为消费者 */}
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                消费者
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-0.5">{userPhone}</p>
            {/* 社区会员号改成编号 */}
            <p className="text-[10px] text-gray-400 font-mono">编号：56952563</p>
          </div>
        </div>

        {/* 消息icon */}
        <button
          onClick={() => setShowMessagesModal(true)}
          className="relative p-2.5 bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 hover:text-emerald-600 rounded-full shadow-2xs transition cursor-pointer"
          title="消息通知"
          id="btn-profile-messages"
        >
          <MessageSquare className="w-4 h-4 text-gray-700" />
          {/* 未读消息红点 */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>
      </div>

      {/* 2. 我的订单 (My Orders Section) */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs space-y-3">
        {/* Header: Title & View All */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-50">
          <div className="flex items-center space-x-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-gray-900">我的订单</h3>
          </div>
          <button
            onClick={() => onGoToOrders('all')}
            className="text-[11px] text-gray-500 hover:text-emerald-600 font-medium flex items-center space-x-0.5 transition cursor-pointer"
            id="btn-view-all-orders"
          >
            <span>全部订单</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {/* 5 Quick Order Status Entry Icons */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {/* 1. 待付款 */}
          <button
            onClick={() => onGoToOrders('pending_pay')}
            className="flex flex-col items-center space-y-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer relative"
            id="order-quick-pending-pay"
          >
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center relative shadow-2xs">
              <CreditCard className="w-4 h-4" />
              {pendingPayCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {pendingPayCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">待付款</span>
          </button>

          {/* 2. 待备货 */}
          <button
            onClick={() => onGoToOrders('preparing')}
            className="flex flex-col items-center space-y-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer relative"
            id="order-quick-preparing"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center relative shadow-2xs">
              <Package className="w-4 h-4" />
              {preparingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {preparingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">待备货</span>
          </button>

          {/* 3. 待自提/发货 */}
          <button
            onClick={() => onGoToOrders('ready')}
            className="flex flex-col items-center space-y-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer relative"
            id="order-quick-ready"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center relative shadow-2xs">
              <QrCode className="w-4 h-4" />
              {readyCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {readyCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">待自提/发货</span>
          </button>

          {/* 4. 待收货 */}
          <button
            onClick={() => onGoToOrders('delivering')}
            className="flex flex-col items-center space-y-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer relative"
            id="order-quick-delivering"
          >
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center relative shadow-2xs">
              <Truck className="w-4 h-4" />
              {deliveringCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {deliveringCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">待收货</span>
          </button>

          {/* 5. 售后/退款 */}
          <button
            onClick={() => onGoToOrders('aftersale')}
            className="flex flex-col items-center space-y-1.5 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer relative"
            id="order-quick-aftersale"
          >
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center relative shadow-2xs">
              <RefreshCw className="w-4 h-4" />
              {aftersaleCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {aftersaleCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">售后/退款</span>
          </button>
        </div>
      </div>

      {/* 3. 商家入驻通道横幅 */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-3.5 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] text-emerald-100 font-bold block">社区商家助手</span>
          <span className="text-xs font-black tracking-tight mt-0.5 block">我是商户 · 进驻社区购接单</span>
        </div>

        <button
          onClick={onSwitchToMerchantRole}
          className="relative z-10 px-3.5 py-1.5 bg-white text-emerald-700 font-black text-[11px] rounded-full shadow-xs hover:bg-emerald-50 transition cursor-pointer flex items-center space-x-1"
          id="btn-enter-merchant-workbench"
        >
          <span>进入商户工作台</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 4. 个人中心菜单列表 (在线客服, 分享) */}
      <div className="bg-white rounded-2xl p-1.5 border border-gray-100 shadow-2xs divide-y divide-gray-50">
        {/* 在线客服 */}
        <div
          onClick={() => setShowChatModal(true)}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          id="menu-online-support"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-800">在线客服</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <span className="text-[10px] text-emerald-600 font-medium">客服在线中</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 分享 */}
        <div
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          id="menu-share-app"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-800">分享</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
              推荐立享福利
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 5. 退出登录按钮 */}
      <button
        onClick={onOpenRoleSwitchModal}
        className="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-black rounded-2xl border border-rose-100 shadow-2xs transition cursor-pointer flex items-center justify-center space-x-1.5"
        id="btn-logout"
      >
        <LogOut className="w-4 h-4" />
        <span>退出登录</span>
      </button>

      {/* Modal 1: 在线客服弹窗 */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-900">社区平台在线客服</h3>
                  <p className="text-[10px] text-emerald-600">● 专属客服 7x24小时为您服务</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5">
              <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-700 leading-relaxed">
                您好，Ella！欢迎来到商企联盟社区购。请问有什么可以帮助您的？
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => alert('已为您转接人工咨询')}
                  className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 text-left transition"
                >
                  💬 咨询订单问题
                </button>
                <button
                  onClick={() => alert('已为您转接积分福利专员')}
                  className="p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 text-left transition"
                >
                  🎁 积分福利核销
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowChatModal(false)}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: 分享弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-gray-900">分享商企联盟小程序</h3>
            <p className="text-xs text-gray-500 mt-1">邀请好友进驻社区商圈，享到店消费立减福利！</p>

            <div className="my-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-left">
              <span className="text-[10px] text-gray-400 block font-semibold">您的专属邀请码</span>
              <span className="text-base font-black text-emerald-600 font-mono tracking-wider">
                COMM-88992
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs flex items-center justify-center space-x-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>链接已复制</span>
                  </>
                ) : (
                  <span>复制分享链接</span>
                )}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: 消息通知弹窗 */}
      {showMessagesModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-gray-900">消息通知</h3>
              </div>
              <button
                onClick={() => setShowMessagesModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2">
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                  <span className="font-bold text-emerald-800">福利到账通知</span>
                  <span>10分钟前</span>
                </div>
                <p className="text-xs text-gray-700">您在悦家折扣超市消费获得的积分已转入积分福利账户。</p>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                  <span className="font-bold text-gray-800">平台系统通知</span>
                  <span>昨天</span>
                </div>
                <p className="text-xs text-gray-700">欢迎加入商企联盟社区商圈，尽享到店自提与福利抵扣！</p>
              </div>
            </div>

            <button
              onClick={() => setShowMessagesModal(false)}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: 编辑个人资料弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-900">编辑个人资料</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">昵称</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">手机号码</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              保存修改
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
