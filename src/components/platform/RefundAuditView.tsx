import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Truck,
  DollarSign,
  ShieldCheck,
  Eye,
  X,
  MessageSquare,
  Clock,
  Sparkles,
  Check,
  Package,
  Store,
  User,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../../types';
import { formatPickupTimePoint } from '../merchant/MerchantOrdersView';

interface RefundAuditViewProps {
  orders: Order[];
  onApproveAfterSale?: (orderNo: string) => void;
  onRejectAfterSale?: (orderNo: string, reason: string) => void;
  onConfirmReceivedAndRefund?: (orderNo: string) => void;
  onInterveneRefund?: (orderNo: string) => void;
}

export const RefundAuditView: React.FC<RefundAuditViewProps> = ({
  orders,
  onApproveAfterSale,
  onRejectAfterSale,
  onConfirmReceivedAndRefund,
  onInterveneRefund,
}) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Reject Modal State
  const [rejectingOrderNo, setRejectingOrderNo] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Aftersale orders list
  const afterSaleOrders = orders.filter(
    (o) => o.orderStatus === 'aftersale' || o.orderStatus === 'refunded' || Boolean(o.afterSale)
  );

  const getAfterSaleNo = (o: Order) => {
    return (
      o.afterSale?.afterSaleNo ||
      `AS${o.orderNo.replace(/\D/g, '').slice(-10) || '20260824001'}`
    );
  };

  const getNormalizedType = (o: Order): 'refund' | 'return' | 'exchange' => {
    const rawType = o.afterSale?.type;
    if (rawType === 'exchange') return 'exchange';
    if (rawType === 'return') return 'return';
    return 'refund'; // default refund / full_refund / partial_refund
  };

  const filteredOrders = afterSaleOrders.filter((o) => {
    const af = o.afterSale;
    const afNo = getAfterSaleNo(o);
    const matchSearch =
      o.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      afNo.toLowerCase().includes(searchText.toLowerCase()) ||
      o.merchantName.toLowerCase().includes(searchText.toLowerCase()) ||
      (af?.reason || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (af?.returnTrackingNo || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (o.fulfillment?.receiverName || o.address?.receiverName || '').toLowerCase().includes(searchText.toLowerCase());

    const afStatus = af?.status || (o.orderStatus === 'refunded' ? 'completed' : 'pending');
    const matchStatus = statusFilter === 'all' || afStatus === statusFilter;
    
    // Normalize type matching
    const matchType = typeFilter === 'all' || getNormalizedType(o) === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const handleConfirmReject = () => {
    if (!rejectingOrderNo) return;
    if (!rejectReason.trim()) {
      alert('请填写驳回原因说明！');
      return;
    }
    if (onRejectAfterSale) {
      onRejectAfterSale(rejectingOrderNo, rejectReason.trim());
    }
    setRejectingOrderNo(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-4">
      {/* Top Query Toolbar & Summary (已删掉批量审核) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Query Filters */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Search Input */}
            <div className="w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索售后号 / 订单号 / 门店 / 物流单号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部审核状态</option>
              <option value="pending">待审核 (48h时效)</option>
              <option value="waiting_customer_ship">待买家寄回</option>
              <option value="customer_shipped">买家已寄出 (待验货)</option>
              <option value="completed">已退款完成</option>
              <option value="rejected">已驳回申请</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部售后类型</option>
              <option value="refund">仅退款</option>
              <option value="return">退货退款</option>
              <option value="exchange">换货</option>
            </select>

            {(searchText || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline cursor-pointer"
              >
                重置筛选
              </button>
            )}
          </div>

          {/* Top Info */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              共 <strong className="text-slate-900 font-mono">{filteredOrders.length}</strong> 笔售后记录
            </span>
          </div>
        </div>
      </div>

      {/* Refunds Table (内容自适应，左右滑动无遮挡，操作固定在最右侧) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">售后编号</th>
                <th className="py-3 px-3 min-w-[150px] whitespace-nowrap">关联订单号</th>
                <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">买家信息</th>
                <th className="py-3 px-3 min-w-[110px] whitespace-nowrap">提货时间</th>
                <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">涉及商户</th>
                <th className="py-3 px-3 min-w-[100px] whitespace-nowrap">售后类型</th>
                <th className="py-3 px-3 min-w-[200px]">退款商品</th>
                <th className="py-3 px-3 w-28 text-right whitespace-nowrap">申请退款额</th>
                <th className="py-3 px-3 min-w-[190px]">退款原因与说明</th>
                <th className="py-3 px-3 min-w-[170px] whitespace-nowrap">退货物流单号</th>
                <th className="py-3 px-3 w-28 text-center whitespace-nowrap">审核状态</th>
                <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">申请售后时间</th>
                <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">退款时间</th>
                {/* 操作列固定在最右侧 */}
                <th className="py-3 px-4 w-40 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    暂无匹配的退款与售后工单记录
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const af = o.afterSale;
                  const afNo = getAfterSaleNo(o);
                  const isCompleted =
                    o.orderStatus === 'refunded' || af?.status === 'completed';
                  const isPending =
                    af?.status === 'pending' ||
                    (o.orderStatus === 'aftersale' && !af?.status);
                  const isShipped = af?.status === 'customer_shipped';
                  const isWaitingShip = af?.status === 'waiting_customer_ship' || af?.status === 'approved';
                  const isRejected = af?.status === 'rejected';
                  const isReturnGoods = af?.type === 'return' || af?.type === 'return_goods';

                  // 买家姓名与电话
                  const receiverName = o.fulfillment?.receiverName || o.address?.receiverName || '买家顾客';
                  const receiverPhone = o.fulfillment?.receiverPhone || o.address?.phone || '';

                  // 退款完成时间
                  const refundTimeText =
                    af?.refundTime ||
                    (isCompleted ? (af?.finishTime || o.finishTime || '2026-08-26 09:35:10') : null);

                  const pickupTimeDisplay = formatPickupTimePoint(
                    o.fulfillment?.selectedPickupTime ||
                      o.selectedPickupTime ||
                      o.fulfillment?.pickupTime ||
                      o.pickupTime ||
                      o.createTime
                  );

                  return (
                    <tr key={o.orderNo} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. 售后编号 */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {afNo}
                        </div>
                      </td>

                      {/* 2. 关联订单号 */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-700 text-xs">
                          {o.orderNo}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold font-sans block">
                          到店自提
                        </span>
                      </td>

                      {/* 3. 买家信息 */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{receiverName}</span>
                        </div>
                        {receiverPhone && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {receiverPhone}
                          </span>
                        )}
                      </td>

                      {/* 提货时间 */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block">
                          {pickupTimeDisplay}
                        </span>
                      </td>

                      {/* 4. 涉及商户 */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 flex items-center space-x-1">
                          <Store className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={o.merchantName}>
                            {o.merchantName}
                          </span>
                        </div>
                      </td>

                      {/* 5. 售后类型 */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getNormalizedType(o) === 'return' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            退货退款
                          </span>
                        ) : getNormalizedType(o) === 'exchange' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            换货
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            仅退款
                          </span>
                        )}
                      </td>

                      {/* 6. 退款商品 */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          {(o.items?.[0]?.image || o.items?.[0]?.imageSnapshot) && (
                            <img
                              src={o.items[0].image || o.items[0].imageSnapshot}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="truncate max-w-[150px]">
                            <div className="truncate text-slate-800 font-medium" title={o.items?.[0]?.name || o.items?.[0]?.titleSnapshot}>
                              {o.items?.[0]?.name || o.items?.[0]?.titleSnapshot || '生鲜/商品'}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              共 {o.items?.reduce((s, i) => s + (i.count || i.quantity || 1), 0) || 1} 件
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 7. 申请退款额 */}
                      <td className="py-3.5 px-3 text-right font-mono font-black text-rose-600 text-xs whitespace-nowrap">
                        ¥{(af?.refundAmount || o.payAmount).toFixed(2)}
                      </td>

                      {/* 8. 退款原因与说明 */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <div className="line-clamp-1 max-w-[180px] text-xs font-medium text-slate-800" title={af?.reason || o.aftersaleReason || '买家申请售后退款'}>
                          {af?.reason || o.aftersaleReason || '买家申请售后退款'}
                        </div>
                        {af?.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]" title={af.description}>
                            说明: {af.description}
                          </div>
                        )}
                      </td>

                      {/* 9. 退货物流单号 (已修复正确展示) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {af?.returnTrackingNo ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-900 font-bold font-mono text-xs flex items-center space-x-1">
                              <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>{af.returnTrackingNo}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans block">
                              {af.returnCourier || af.returnCourierCompany || '顺丰速运'}
                              {af.returnTime && ` · ${af.returnTime}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">
                            {isReturnGoods ? (
                              isWaitingShip ? '待买家寄回' : '未寄出'
                            ) : (
                              '无需退货'
                            )}
                          </span>
                        )}
                      </td>

                      {/* 10. 审核状态 */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            待审核
                          </span>
                        )}
                        {isWaitingShip && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            待买家寄回
                          </span>
                        )}
                        {isShipped && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                            已寄出待验货
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            退款成功
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            已驳回
                          </span>
                        )}
                      </td>

                      {/* 11. 申请售后时间 */}
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {af?.applyTime || o.createTime}
                      </td>

                      {/* 12. 增加：退款时间 */}
                      <td className="py-3.5 px-3 font-mono text-xs whitespace-nowrap">
                        {refundTimeText ? (
                          <span className="font-bold text-emerald-700">
                            {refundTimeText}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans">
                            {isRejected ? '已驳回(无退款)' : '待退款'}
                          </span>
                        )}
                      </td>

                      {/* 13. 操作固定在最右侧 */}
                      <td className="py-3.5 px-4 text-right sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => onApproveAfterSale && onApproveAfterSale(o.orderNo)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => setRejectingOrderNo(o.orderNo)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                驳回
                              </button>
                            </>
                          )}

                          {isShipped && (
                            <button
                              onClick={() =>
                                onConfirmReceivedAndRefund &&
                                onConfirmReceivedAndRefund(o.orderNo)
                              }
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                            >
                              验货并退款
                            </button>
                          )}

                          {isWaitingShip && (
                            <span className="text-[11px] text-blue-600 font-medium">
                              等待买家寄回
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center space-x-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>已原路退回</span>
                            </span>
                          )}

                          {isRejected && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              已驳回申请
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 驳回原因弹窗 Modal */}
      {rejectingOrderNo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">驳回售后退款申请</h3>
              <button
                onClick={() => setRejectingOrderNo(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-700 font-bold block">
                驳回原因说明 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="请详细填写驳回理由（如：商品无质量问题、已过售后时效、未提前联系门店等），买家端将同步查看此说明..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingOrderNo(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
