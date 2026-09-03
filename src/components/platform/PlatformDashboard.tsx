import React, { useState } from 'react';
import {
  FolderTree,
  Truck,
  ShoppingBag,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Search,
  Layers,
  Settings2,
  AlertCircle,
  RotateCcw,
  Eye,
  TrendingUp,
  PieChart,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { Order, MerchantConfig, Product } from '../../types';
import { CategoryManageView } from './CategoryManageView';
import { OrderInspectView } from './OrderInspectView';
import { OrderExceptionView } from './OrderExceptionView';
import { RefundAuditView } from './RefundAuditView';
import { BasicDataAnalyticsView } from './BasicDataAnalyticsView';

export type AdminMenuKey =
  | 'categories' // 商家分类
  | 'orders_view' // 订单管理 -> 订单查看
  | 'orders_exception' // 订单管理 -> 异常处理
  | 'orders_refund' // 订单管理 -> 退款审核
  | 'analytics'; // 基础数据 (交易额、订单量分析)

interface PlatformDashboardProps {
  orders: Order[];
  merchants: MerchantConfig[];
  products?: Product[];
  onUpdateMerchantConfig?: (merchant: MerchantConfig) => void;
  onInterveneRefund?: (orderNo: string) => void;
  onApproveAfterSale?: (orderNo: string) => void;
  onRejectAfterSale?: (orderNo: string, reason: string) => void;
  onConfirmReceivedAndRefund?: (orderNo: string) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({
  orders,
  merchants,
  products = [],
  onUpdateMerchantConfig,
  onInterveneRefund,
  onApproveAfterSale,
  onRejectAfterSale,
  onConfirmReceivedAndRefund,
}) => {
  // Default active menu
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('categories');

  // Expanded menu sections state (orders group)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    orders: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Badges calculation
  const pendingRefundCount = orders.filter(
    (o) => o.afterSale?.status === 'pending' || (o.orderStatus === 'aftersale' && !o.afterSale)
  ).length;

  const exceptionCount = 4; // active exceptions

  // Breadcrumb text resolver
  const getBreadcrumb = () => {
    switch (activeMenu) {
      case 'categories':
        return { primary: '商家分类', sub: '' };
      case 'orders_view':
        return { primary: '订单管理', sub: '订单查看' };
      case 'orders_exception':
        return { primary: '订单管理', sub: '异常处理' };
      case 'orders_refund':
        return { primary: '订单管理', sub: '退款审核' };
      case 'analytics':
        return { primary: '基础数据', sub: '交易额 · 订单量分析' };
      default:
        return { primary: '管理后台', sub: '' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="w-full h-full flex bg-[#F8FAFC] text-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      {/* PC Admin Left Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="flex-1 overflow-y-auto">
          {/* Brand & Logo Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">管理后台</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">ADMIN PLATFORM</p>
            </div>
          </div>

          {/* Structured Menu Tree */}
          <nav className="p-3 space-y-1.5">
            {/* 1. 商家分类 (Menu Item) */}
            <div>
              <button
                onClick={() => setActiveMenu('categories')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'categories'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>商家分类</span>
              </button>
            </div>

            {/* 2. 订单管理 (Group with 3 Sub-items) */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  toggleSection('orders');
                  if (!activeMenu.startsWith('orders')) {
                    setActiveMenu('orders_view');
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu.startsWith('orders')
                    ? 'text-emerald-400 bg-slate-800/90'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>订单管理</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {(pendingRefundCount > 0 || exceptionCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  {expandedSections.orders ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSections.orders && (
                <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => setActiveMenu('orders_view')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeMenu === 'orders_view'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    <span>订单查看</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('orders_exception')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeMenu === 'orders_exception'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>异常处理</span>
                    </div>
                    {exceptionCount > 0 && (
                      <span className="bg-rose-500/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                        {exceptionCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveMenu('orders_refund')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeMenu === 'orders_refund'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>退款审核</span>
                    </div>
                    {pendingRefundCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                        {pendingRefundCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 4. 基础数据 (Single Menu Item - NO Submenus!) */}
            <div>
              <button
                onClick={() => setActiveMenu('analytics')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>基础数据</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Admin Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300">微信物流助手 / 达达 在线</span>
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between items-center font-mono">
            <span>v2.6.0 (PRD对齐)</span>
            <span>PROD</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          {/* Breadcrumb Path */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">后台管理</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-bold">{breadcrumb.primary}</span>
            {breadcrumb.sub && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-emerald-700 font-black">{breadcrumb.sub}</span>
              </>
            )}
          </div>

          {/* User Profile & Right Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-xs">
                管
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-900 leading-tight">平台运营中枢</div>
                <div className="text-[10px] text-slate-400">超级管理员 (SuperAdmin)</div>
              </div>
            </div>
          </div>
        </header>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* 1. 商家分类 */}
            {activeMenu === 'categories' && (
              <CategoryManageView products={products} merchants={merchants} />
            )}

            {/* 2. 订单管理 -> 订单查看 */}
            {activeMenu === 'orders_view' && (
              <OrderInspectView orders={orders} />
            )}

            {/* 4. 订单管理 -> 异常处理 */}
            {activeMenu === 'orders_exception' && (
              <OrderExceptionView
                orders={orders}
                onInterveneRefund={onInterveneRefund}
              />
            )}

            {/* 5. 订单管理 -> 退款审核 */}
            {activeMenu === 'orders_refund' && (
              <RefundAuditView
                orders={orders}
                onApproveAfterSale={onApproveAfterSale}
                onRejectAfterSale={onRejectAfterSale}
                onConfirmReceivedAndRefund={onConfirmReceivedAndRefund}
                onInterveneRefund={onInterveneRefund}
              />
            )}

            {/* 6. 基础数据 (交易额，订单量，自提/配送占比 统一展示) */}
            {activeMenu === 'analytics' && (
              <BasicDataAnalyticsView orders={orders} merchants={merchants} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
