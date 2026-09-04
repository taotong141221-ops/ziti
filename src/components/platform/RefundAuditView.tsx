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
  AlertTriangle,
  Image as ImageIcon,
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

  // Quick rejection reasons presets
  const QUICK_REJECT_PRESETS = [
    '商品已正常自提消费完毕，无质量问题',
    '已超过平台售后有效受理时效（48小时）',
    '生鲜即食食品非质量问题不予退货退款',
    '买家未按约定时间自提且门店已备餐完成',
    '商品实物及外包装完好，买家个人原因申请',
  ];

  // Reject Modal State (Step 1: Fill Reason)
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Evidence photo preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Secondary Confirmation Modal State (Step 2: Mandatory 2nd Confirm for ALL Operations)
  type AuditConfirmType = 'approve' | 'reject' | 'confirm_received_refund' | 'intervene_refund';
  interface AuditConfirmAction {
    type: AuditConfirmType;
    order: Order;
    rejectReason?: string;
  }
  const [pendingConfirmAction, setPendingConfirmAction] = useState<AuditConfirmAction | null>(null);

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

  // Action Triggers -> Mandatorily open Secondary Confirmation
  const triggerApprove = (order: Order) => {
    setPendingConfirmAction({
      type: 'approve',
      order,
    });
  };

  const triggerRejectInput = (order: Order) => {
    setRejectModalOrder(order);
    if (!rejectReason) {
      setRejectReason(QUICK_REJECT_PRESETS[0]);
    }
  };

  const handleProceedToRejectConfirm = () => {
    if (!rejectModalOrder) return;
    if (!rejectReason.trim()) {
      alert('请填写或选择驳回原因！');
      return;
    }
    setPendingConfirmAction({
      type: 'reject',
      order: rejectModalOrder,
      rejectReason: rejectReason.trim(),
    });
    setRejectModalOrder(null);
  };

  const triggerConfirmReceivedRefund = (order: Order) => {
    setPendingConfirmAction({
      type: 'confirm_received_refund',
      order,
    });
  };

  const triggerInterveneRefund = (order: Order) => {
    setPendingConfirmAction({
      type: 'intervene_refund',
      order,
    });
  };

  // Final execution after secondary confirmation is confirmed
  const handleExecuteConfirmedAction = () => {
    if (!pendingConfirmAction) return;
    const { type, order, rejectReason: finalReason } = pendingConfirmAction;

    if (type === 'approve') {
      if (onApproveAfterSale) {
        onApproveAfterSale(order.orderNo);
      }
    } else if (type === 'reject') {
      if (onRejectAfterSale) {
        onRejectAfterSale(order.orderNo, finalReason || '经审核不符合退款条件');
      }
      setRejectReason('');
    } else if (type === 'confirm_received_refund') {
      if (onConfirmReceivedAndRefund) {
        onConfirmReceivedAndRefund(order.orderNo);
      }
    } else if (type === 'intervene_refund') {
      if (onInterveneRefund) {
        onInterveneRefund(order.orderNo);
      }
    }

    setPendingConfirmAction(null);
    setSelectedOrder(null);
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
                          {/* 详情查看 */}
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center space-x-1"
                            title="查看售后详情"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>详情</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => triggerApprove(o)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => triggerRejectInput(o)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                驳回
                              </button>
                            </>
                          )}

                          {isShipped && (
                            <button
                              onClick={() => triggerConfirmReceivedRefund(o)}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                            >
                              验货并退款
                            </button>
                          )}

                          {isWaitingShip && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[11px] text-blue-600 font-medium">
                                待买家寄回
                              </span>
                              {onInterveneRefund && (
                                <button
                                  onClick={() => triggerInterveneRefund(o)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-md transition cursor-pointer"
                                  title="平台介入直接退款"
                                >
                                  介入退款
                                </button>
                              )}
                            </div>
                          )}

                          {isCompleted && (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center space-x-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>已原路退回</span>
                            </span>
                          )}

                          {isRejected && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[11px] text-slate-400 font-medium">
                                已驳回
                              </span>
                              {onInterveneRefund && (
                                <button
                                  onClick={() => triggerInterveneRefund(o)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-md transition cursor-pointer"
                                  title="争议申诉：平台介入退款"
                                >
                                  介入退款
                                </button>
                              )}
                            </div>
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

      {/* 1. 驳回售后退款申请弹窗 (Step 1: 录入驳回理由) */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">驳回售后退款申请</h3>
                  <p className="text-[11px] text-slate-400">第一步：请填写驳回原因说明</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 订单摘要卡片 */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">售后编号：</span>
                <span className="font-mono font-bold text-slate-800">{getAfterSaleNo(rejectModalOrder)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">申请退款额：</span>
                <span className="font-mono font-bold text-rose-600">
                  ¥{(rejectModalOrder.afterSale?.refundAmount || rejectModalOrder.payAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">买家申请原因：</span>
                <span className="text-slate-700 truncate max-w-[240px]">
                  {rejectModalOrder.afterSale?.reason || rejectModalOrder.aftersaleReason || '买家申请售后退款'}
                </span>
              </div>
            </div>

            {/* 快捷理由预设 */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-bold block">
                快捷选择常见驳回理由：
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REJECT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition text-left cursor-pointer ${
                      rejectReason === preset
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 详细驳回原因输入框 */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-bold block">
                驳回原因详细说明 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="请详细填写驳回理由，买家端将同步查阅此说明..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleProceedToRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <span>下一步：二次确认驳回</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 【核心】所有退款审核操作的“二次确认”统一弹窗 Modal */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* 弹窗顶部标示与操作警示 */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {pendingConfirmAction.type === 'approve' && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}
                {pendingConfirmAction.type === 'reject' && (
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                {pendingConfirmAction.type === 'confirm_received_refund' && (
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                )}
                {pendingConfirmAction.type === 'intervene_refund' && (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900">
                      {pendingConfirmAction.type === 'approve' && '二次确认：确认审核通过此售后申请？'}
                      {pendingConfirmAction.type === 'reject' && '二次确认：确认驳回此售后退款申请？'}
                      {pendingConfirmAction.type === 'confirm_received_refund' && '二次确认：确认验货通过并原路退款？'}
                      {pendingConfirmAction.type === 'intervene_refund' && '二次确认：平台介入强制全额退款？'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    请仔细核对以下售后工单明细与操作影响，确认后将立即执行
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPendingConfirmAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 工单核验卡片 */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[11px]">售后工单号</span>
                  <span className="font-mono font-bold text-slate-900">
                    {getAfterSaleNo(pendingConfirmAction.order)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">关联订单号</span>
                  <span className="font-mono font-bold text-slate-800">
                    {pendingConfirmAction.order.orderNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">买家信息</span>
                  <span className="font-medium text-slate-800">
                    {pendingConfirmAction.order.fulfillment?.receiverName || pendingConfirmAction.order.address?.receiverName || '买家顾客'}
                    {' '}
                    <span className="text-slate-400 font-mono">
                      ({pendingConfirmAction.order.fulfillment?.receiverPhone || pendingConfirmAction.order.address?.phone || '自提'})
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">涉及商户门店</span>
                  <span className="font-medium text-slate-800 truncate block">
                    {pendingConfirmAction.order.merchantName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">售后类型</span>
                  <span className="font-bold text-slate-800">
                    {getNormalizedType(pendingConfirmAction.order) === 'return' ? '退货退款' : getNormalizedType(pendingConfirmAction.order) === 'exchange' ? '换货' : '仅退款'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">申请退款金额</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    ¥{(pendingConfirmAction.order.afterSale?.refundAmount || pendingConfirmAction.order.payAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 买家申请原因 */}
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block text-[11px]">买家申请理由：</span>
                <span className="text-slate-700 font-medium">
                  {pendingConfirmAction.order.afterSale?.reason || pendingConfirmAction.order.aftersaleReason || '买家申请退款'}
                  {pendingConfirmAction.order.afterSale?.description && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      补充说明：{pendingConfirmAction.order.afterSale.description}
                    </span>
                  )}
                </span>
              </div>

              {/* 驳回操作专有：展示驳回原因 */}
              {pendingConfirmAction.type === 'reject' && (
                <div className="pt-2 border-t border-rose-100 bg-rose-50/70 p-2.5 rounded-xl border">
                  <span className="text-rose-600 font-bold block text-[11px]">
                    本次审核驳回原因 (买家端将同步显示)：
                  </span>
                  <p className="text-rose-950 font-bold mt-1 text-xs">
                    “{pendingConfirmAction.rejectReason}”
                  </p>
                </div>
              )}

              {/* 验货退款专有：展示退货物流 */}
              {pendingConfirmAction.type === 'confirm_received_refund' && (
                <div className="pt-2 border-t border-teal-100 bg-teal-50/70 p-2.5 rounded-xl border">
                  <span className="text-teal-700 font-bold block text-[11px]">
                    买家寄回运单：
                  </span>
                  <div className="font-mono font-bold text-teal-950 mt-0.5">
                    {pendingConfirmAction.order.afterSale?.returnCourier || '顺丰速运'} · {pendingConfirmAction.order.afterSale?.returnTrackingNo || '已寄出'}
                  </div>
                </div>
              )}
            </div>

            {/* 操作不可逆提示条 */}
            <div className={`p-3 rounded-xl text-xs font-medium border ${
              pendingConfirmAction.type === 'reject'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : pendingConfirmAction.type === 'intervene_refund'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {pendingConfirmAction.type === 'approve' && (
                <div>
                  <p className="font-bold">⚠️ 操作提示：</p>
                  {getNormalizedType(pendingConfirmAction.order) === 'refund' || pendingConfirmAction.order.fulfillType === 'pickup' ? (
                    <p className="mt-0.5">
                      审核通过后，系统将<strong>立即原路退款 ¥{(pendingConfirmAction.order.afterSale?.refundAmount || pendingConfirmAction.order.payAmount).toFixed(2)}</strong> 给买家支付账户。<strong>此操作不可撤销</strong>，请仔细核验！
                    </p>
                  ) : (
                    <p className="mt-0.5">
                      审核通过后，将同意买家退货申请并通知买家将商品原包装寄回。待买家寄出并验货无误后，再行触发退款。
                    </p>
                  )}
                </div>
              )}

              {pendingConfirmAction.type === 'reject' && (
                <div>
                  <p className="font-bold">🚨 严重警示：</p>
                  <p className="mt-0.5">
                    确认驳回后，该售后工单将被<strong>正式关闭</strong>，系统不再自动执行退款，买家端将同步显示驳回原因。请确认已与买家或门店沟通清楚。
                  </p>
                </div>
              )}

              {pendingConfirmAction.type === 'confirm_received_refund' && (
                <div>
                  <p className="font-bold">⚠️ 验货退款提示：</p>
                  <p className="mt-0.5">
                    请确认仓库或门店已实物收到买家退回的包裹，且商品查验完好无损。确认后将<strong>立即向买家原路退款 ¥{(pendingConfirmAction.order.afterSale?.refundAmount || pendingConfirmAction.order.payAmount).toFixed(2)}</strong>，不可撤销。
                  </p>
                </div>
              )}

              {pendingConfirmAction.type === 'intervene_refund' && (
                <div>
                  <p className="font-bold">⚡ 管理员特权操作：</p>
                  <p className="mt-0.5">
                    平台管理员介入将跳过商户与常规退换货审核流程，直接为订单执行<strong>全额原路退款 ¥{pendingConfirmAction.order.payAmount.toFixed(2)}</strong>，并完结争议工单。
                  </p>
                </div>
              )}
            </div>

            {/* 二次确认操作按钮 */}
            <div className="flex items-center justify-end space-x-2.5 pt-1">
              {pendingConfirmAction.type === 'reject' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalOrder(pendingConfirmAction.order);
                      setPendingConfirmAction(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    返回修改原因
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteConfirmedAction}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>确认驳回申请</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPendingConfirmAction(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteConfirmedAction}
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1 ${
                      pendingConfirmAction.type === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : pendingConfirmAction.type === 'confirm_received_refund'
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {pendingConfirmAction.type === 'approve' && '确认审核通过'}
                      {pendingConfirmAction.type === 'confirm_received_refund' && '确认验货无误，立即退款'}
                      {pendingConfirmAction.type === 'intervene_refund' && '确认平台强制退款'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. 售后工单详情查看弹窗 Modal (点击详情查看凭据/图片/时间轴) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    售后工单详情 · {getAfterSaleNo(selectedOrder)}
                  </h3>
                  <p className="text-[11px] text-slate-400">关联订单号: {selectedOrder.orderNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 售后状态与基础概况 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">当前状态</span>
                <span className="font-bold text-slate-800">
                  {selectedOrder.orderStatus === 'refunded' || selectedOrder.afterSale?.status === 'completed'
                    ? '退款完成'
                    : selectedOrder.afterSale?.status === 'rejected'
                    ? '已驳回'
                    : selectedOrder.afterSale?.status === 'customer_shipped'
                    ? '买家已寄出待验货'
                    : selectedOrder.afterSale?.status === 'waiting_customer_ship'
                    ? '待买家寄回'
                    : '待审核'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">售后类型</span>
                <span className="font-bold text-slate-800">
                  {getNormalizedType(selectedOrder) === 'return' ? '退货退款' : getNormalizedType(selectedOrder) === 'exchange' ? '换货' : '仅退款'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">实付款</span>
                <span className="font-mono font-bold text-slate-800">¥{selectedOrder.payAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">申请退款额</span>
                <span className="font-mono font-black text-rose-600">
                  ¥{(selectedOrder.afterSale?.refundAmount || selectedOrder.payAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 商品信息列表 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">涉及商品明细</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      {(item.image || item.imageSnapshot) && (
                        <img
                          src={item.image || item.imageSnapshot}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <div className="font-bold text-slate-800">{item.name || item.titleSnapshot}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.specTitle || item.skuName || '标准规格'} × {item.count || item.quantity || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        ¥{((item.price || item.unitPrice || 0) * (item.count || item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 售后原因与证据图片 */}
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">退款申请原因</span>
                <p className="text-slate-800 font-bold mt-0.5">
                  {selectedOrder.afterSale?.reason || selectedOrder.aftersaleReason || '买家申请售后'}
                </p>
                {selectedOrder.afterSale?.description && (
                  <p className="text-slate-600 text-[11px] mt-1 bg-white p-2 rounded-lg border border-slate-200/60">
                    说明：{selectedOrder.afterSale.description}
                  </p>
                )}
              </div>

              {/* 买家凭证图片 */}
              {selectedOrder.afterSale?.images && selectedOrder.afterSale.images.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px] mb-1.5">买家上传凭证图：</span>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {selectedOrder.afterSale.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in"
                      >
                        <img
                          src={img}
                          alt="凭证"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作条 (详情内点击同样进入二次确认) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                申请时间: {selectedOrder.afterSale?.applyTime || selectedOrder.createTime}
              </span>

              <div className="flex items-center space-x-2">
                {selectedOrder.afterSale?.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => triggerRejectInput(selectedOrder)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      驳回申请
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerApprove(selectedOrder)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      审核通过
                    </button>
                  </>
                )}

                {selectedOrder.afterSale?.status === 'customer_shipped' && (
                  <button
                    type="button"
                    onClick={() => triggerConfirmReceivedRefund(selectedOrder)}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    验货并退款
                  </button>
                )}

                {(selectedOrder.afterSale?.status === 'rejected' || selectedOrder.afterSale?.status === 'waiting_customer_ship') && onInterveneRefund && (
                  <button
                    type="button"
                    onClick={() => triggerInterveneRefund(selectedOrder)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    平台介入强制退款
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 图片大图预览 Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={previewImage}
              alt="大图"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
