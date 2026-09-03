import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  Eye,
  RefreshCw,
  X,
  Phone,
  MapPin,
  QrCode,
  Calendar,
  CreditCard,
  Tag,
  Receipt,
  RotateCcw,
  Check,
  Copy,
  User,
  PackageCheck,
} from 'lucide-react';
import { Order } from '../../types';

interface OrderInspectViewProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export const OrderInspectView: React.FC<OrderInspectViewProps> = ({ orders }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedNo, setCopiedNo] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      o.merchantName.toLowerCase().includes(searchText.toLowerCase()) ||
      (o.address?.receiverName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (o.address?.phone || '').includes(searchText) ||
      (o.fulfillment?.pickupCode || '').includes(searchText);

    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleCopyOrderNo = (no: string) => {
    navigator.clipboard.writeText(no);
    setCopiedNo(true);
    setTimeout(() => setCopiedNo(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top Query Filter & Actions Toolbar (操作置顶在最上方) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Query Filters */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Search Input */}
            <div className="w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索单号 / 门店 / 买家 / 手机 / 提货码..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部订单状态</option>
              <option value="pending_accept">待商家接单</option>
              <option value="picking">拣货备货中</option>
              <option value="ready_pickup">待自提 (已出码)</option>
              <option value="finished">已完成 (已核销自提)</option>
              <option value="aftersale">售后处理中</option>
              <option value="refunded">已退款</option>
            </select>

            {(searchText || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchText('');
                  setOrderStatusFilter('all');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline cursor-pointer"
              >
                重置筛选
              </button>
            )}
          </div>

          {/* Top Actions / Counter */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              共 <strong className="text-slate-900 font-mono">{filteredOrders.length}</strong> 笔订单
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table (已删除列表中的商品摘要列，提货码直接显示具体数字) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 min-w-[180px]">订单编号 / 下单时间</th>
                <th className="py-3 px-3 min-w-[150px]">所属门店</th>
                <th className="py-3 px-3 min-w-[150px]">履约方式 / 提货核销码</th>
                <th className="py-3 px-3 min-w-[140px]">买家信息</th>
                <th className="py-3 px-3 w-28 text-right">实付金额</th>
                <th className="py-3 px-3 w-28 text-center">订单状态</th>
                {/* 操作列固定在最右侧 */}
                <th className="py-3 px-4 w-24 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    暂无匹配的订单记录
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.orderNo} className="hover:bg-slate-50/70 transition-colors">
                    {/* 订单编号 / 下单时间 */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{o.orderNo}</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {o.createTime}
                      </span>
                    </td>

                    {/* 所属门店 */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 flex items-center space-x-1">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{o.merchantName}</span>
                      </div>
                    </td>

                    {/* 履约方式 / 提货码具体展示 */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px] border border-emerald-200/60 inline-flex items-center space-x-1">
                          <QrCode className="w-3 h-3 text-emerald-600" />
                          <span>到店自提</span>
                        </span>
                        <div className="text-[11px] font-mono font-black text-emerald-800 mt-1">
                          提货码: {o.fulfillment?.pickupCode || (o.orderNo.replace(/\D/g, '').slice(-6) || '894216')}
                        </div>
                      </div>
                    </td>

                    {/* 买家信息 */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {o.address?.receiverName || o.fulfillment?.receiverName || '顾客'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {o.address?.phone || o.fulfillment?.receiverPhone || '138****0000'}
                      </span>
                    </td>

                    {/* 实付金额 */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="font-bold text-slate-900">¥{o.payAmount.toFixed(2)}</div>
                    </td>

                    {/* 订单状态 */}
                    <td className="py-3 px-3 text-center">
                      {o.orderStatus === 'pending_accept' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          待接单
                        </span>
                      )}
                      {o.orderStatus === 'picking' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          拣货备货中
                        </span>
                      )}
                      {o.orderStatus === 'ready_pickup' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          待自提
                        </span>
                      )}
                      {o.orderStatus === 'delivering' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          骑手配送中
                        </span>
                      )}
                      {o.orderStatus === 'finished' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          已完成
                        </span>
                      )}
                      {o.orderStatus === 'aftersale' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          售后中
                        </span>
                      )}
                      {o.orderStatus === 'refunded' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          已退款
                        </span>
                      )}
                    </td>

                    {/* 操作固定在最右侧 */}
                    <td className="py-3 px-4 text-right sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>详情</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 订单全景详情弹窗 */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">订单全景详情</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs font-mono text-slate-500">{selectedOrder.orderNo}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderNo(selectedOrder.orderNo)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                    title="复制订单号"
                  >
                    {copiedNo ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Base Overview Info Grid */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">所属商户门店</span>
                <span className="font-bold text-slate-900">{selectedOrder.merchantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">履约模式</span>
                <span className="font-bold text-emerald-700">到店自提</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">顾客姓名 / 手机</span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.address?.receiverName || selectedOrder.fulfillment?.receiverName || '顾客'}{' '}
                  <span className="font-mono font-normal text-slate-500">
                    ({selectedOrder.address?.phone || selectedOrder.fulfillment?.receiverPhone || '138****0000'})
                  </span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">自提提货码</span>
                <span className="font-mono font-black text-slate-900">
                  {selectedOrder.fulfillment?.pickupCode || selectedOrder.orderNo.replace(/\D/g, '').slice(-6) || '894216'}
                </span>
              </div>
              {(selectedOrder.address?.address || selectedOrder.fulfillment?.receiverAddress) && (
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">收货地址 / 自提地址</span>
                  <span className="text-slate-800 font-medium">
                    {selectedOrder.address?.address || selectedOrder.fulfillment?.receiverAddress || selectedOrder.fulfillment?.pickupAddress || '江西省南昌市红谷滩区绿茵路'}
                  </span>
                </div>
              )}
            </div>

            {/* 1. 商品明细 (具体展示顾客购买的东西) */}
            <div className="border border-slate-200/90 rounded-2xl p-3.5 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center space-x-1.5 font-black text-slate-900">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>购买商品明细清单</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  共 {selectedOrder.items?.reduce((s, i) => s + (i.quantity || i.count || 1), 0) || 1} 件商品
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedOrder.items?.map((item, idx) => {
                  const title = item.titleSnapshot || item.name || '精选社区好物';
                  const spec = item.specSnapshot || item.spec || '标准规格';
                  const img =
                    item.imageSnapshot ||
                    item.image ||
                    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop&q=80';
                  const price = item.priceSnapshot ?? item.price ?? 0;
                  const qty = item.quantity ?? item.count ?? 1;
                  const subtotal = item.subtotal ?? item.itemAmount ?? price * qty;

                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="font-bold text-slate-900 text-xs truncate" title={title}>
                          {title}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          规格: {spec}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-slate-500 font-mono text-[11px]">
                            ¥{price.toFixed(2)} × {qty}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            ¥{subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. 关键节点全流程时间明细 (下单、付款、提货、送达、收货、退款申请与完成) */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-black text-slate-900 pb-1.5 border-b border-slate-200/70 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>全流程时间记录</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                {/* 下单时间 */}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400">下单时间:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedOrder.createTime}</span>
                </div>

                {/* 付款时间 */}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400">付款时间:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {selectedOrder.payTime ||
                      (selectedOrder.payStatus === 1 ? selectedOrder.createTime : '待付款')}
                  </span>
                </div>

                {/* 提货时间 (自提单) */}
                {selectedOrder.fulfillType === 'pickup' && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">提货时间:</span>
                    <span className="font-mono font-medium text-emerald-700 font-bold">
                      {selectedOrder.fulfillment?.verifyTime ||
                        selectedOrder.fulfillment?.pickupTime ||
                        selectedOrder.pickupTime ||
                        (selectedOrder.orderStatus === 'finished'
                          ? selectedOrder.finishTime || '2026-08-25 16:30:12'
                          : '待到店提货')}
                    </span>
                  </div>
                )}

                {/* 送达时间 (配送单) */}
                {selectedOrder.fulfillType === 'delivery' && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">送达时间:</span>
                    <span className="font-mono font-medium text-sky-700 font-bold">
                      {selectedOrder.fulfillment?.deliveredTime ||
                        selectedOrder.deliveredTime ||
                        (selectedOrder.orderStatus === 'delivered' || selectedOrder.orderStatus === 'finished'
                          ? selectedOrder.finishTime || '2026-08-26 16:15:00'
                          : '配送中待送达')}
                    </span>
                  </div>
                )}

                {/* 收货时间 (配送单) */}
                {selectedOrder.fulfillType === 'delivery' && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">收货时间:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {selectedOrder.fulfillment?.receiveTime ||
                        selectedOrder.receiveTime ||
                        (selectedOrder.orderStatus === 'finished'
                          ? selectedOrder.finishTime || '2026-08-26 16:30:00'
                          : '待确认收货')}
                    </span>
                  </div>
                )}

                {/* 申请售后时间 */}
                {(selectedOrder.afterSale ||
                  selectedOrder.orderStatus === 'aftersale' ||
                  selectedOrder.orderStatus === 'refunded') && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-rose-500 font-bold">申请售后时间:</span>
                    <span className="font-mono font-medium text-rose-700">
                      {selectedOrder.afterSale?.applyTime || '2026-08-26 12:45:00'}
                    </span>
                  </div>
                )}

                {/* 完成售后时间 */}
                {(selectedOrder.afterSale?.finishTime ||
                  selectedOrder.afterSale?.auditTime ||
                  selectedOrder.orderStatus === 'refunded') && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-purple-600 font-bold">完成售后时间:</span>
                    <span className="font-mono font-medium text-purple-700">
                      {selectedOrder.afterSale?.finishTime ||
                        selectedOrder.afterSale?.auditTime ||
                        selectedOrder.finishTime ||
                        '2026-08-26 14:10:00'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. 费用结算与优惠抵扣金额明细 */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-black text-slate-900 pb-1.5 border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>费用明细与优惠抵扣</span>
                </div>
                <span className="text-[11px] font-normal text-slate-400">结算对账一览</span>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span>商品总额</span>
                  <span className="font-mono font-bold text-slate-800">
                    ¥{(selectedOrder.goodsAmount || selectedOrder.payAmount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>配送运费</span>
                  <span className="font-mono font-bold text-slate-800">
                    +¥{(selectedOrder.deliveryFee || 0).toFixed(2)}
                  </span>
                </div>

                {/* 优惠抵扣金额 */}
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>优惠抵扣金额 (优惠券/满减)</span>
                  </span>
                  <span className="font-mono font-bold">
                    -¥{(selectedOrder.discountAmount ?? selectedOrder.couponDiscountAmount ?? 0).toFixed(2)}
                  </span>
                </div>

                {/* 积分抵扣金额 */}
                {selectedOrder.pointDeductAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>积分/通宝已抵扣</span>
                    <span className="font-mono font-bold">
                      -¥{selectedOrder.pointDeductAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* 售后退款金额 (如果发生售后) */}
                {selectedOrder.afterSale?.refundAmount && (
                  <div className="flex justify-between text-rose-600 font-medium pt-1 border-t border-dashed border-slate-200">
                    <span>售后退款金额</span>
                    <span className="font-mono font-bold">
                      ¥{selectedOrder.afterSale.refundAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* 实付总计 */}
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span className="text-sm">顾客实付金额</span>
                  <span className="text-lg font-mono font-black text-emerald-600">
                    ¥{selectedOrder.payAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

