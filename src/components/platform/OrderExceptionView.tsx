import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  RotateCcw,
  Store,
  CheckCircle2,
  PhoneCall,
  RefreshCw,
  Zap,
  ShieldAlert,
  Send,
  UserCheck,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { Order } from '../../types';

interface OrderExceptionViewProps {
  orders: Order[];
  onInterveneRefund?: (orderNo: string) => void;
}

export interface ExceptionItem {
  id: string;
  orderNo: string;
  merchantName: string;
  type: 'accept_timeout' | 'pickup_overdue' | 'stock_out';
  typeName: string;
  severity: 'high' | 'medium' | 'low';
  orderTime: string;
  durationText: string;
  description: string;
  payAmount: number;
  status: 'pending' | 'resolved' | 'refunded';
}

const INITIAL_EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'EX001',
    orderNo: 'SF20260828000003',
    merchantName: '老街坊生鲜超市',
    type: 'accept_timeout',
    typeName: '商家接单超时 (>5min)',
    severity: 'high',
    orderTime: '2026-08-28 10:14:00',
    durationText: '已超时 7 分钟',
    description: '顾客已支付但商家后厨/店员未在5分钟规定时限内确认接单，请及时催单或触发兜底退款。',
    payAmount: 64.9,
    status: 'pending',
  },
  {
    id: 'EX002',
    orderNo: 'SF20260827000088',
    merchantName: '老街坊生鲜超市',
    type: 'pickup_overdue',
    typeName: '自提提货码逾期未领 (>48h)',
    severity: 'low',
    orderTime: '2026-08-26 09:00:00',
    durationText: '已逾期 50 小时',
    description: '顾客未按时到店出示提货码【728190】，生鲜冷藏商品已由门店暂存在自提保鲜柜。',
    payAmount: 35.8,
    status: 'pending',
  },
  {
    id: 'EX003',
    orderNo: 'SF20260828000012',
    merchantName: '百年老字号牛肉面馆',
    type: 'stock_out',
    typeName: '门店商品临时缺货',
    severity: 'medium',
    orderTime: '2026-08-28 11:05:00',
    durationText: '待协商换货/退款',
    description: '商家备餐发现指定特色小料已售罄，正联系顾客进行换品确认或部分差额退款。',
    payAmount: 28.5,
    status: 'pending',
  },
];

export const OrderExceptionView: React.FC<OrderExceptionViewProps> = ({
  orders,
  onInterveneRefund,
}) => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredExceptions = exceptions.filter((ex) => {
    const matchSearch =
      ex.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      ex.merchantName.toLowerCase().includes(searchText.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchText.toLowerCase());

    const matchType = filterType === 'all' || ex.type === filterType;
    const matchSeverity = severityFilter === 'all' || ex.severity === severityFilter;

    return matchSearch && matchType && matchSeverity;
  });

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleUrgeMerchant = (ex: ExceptionItem) => {
    showFeedback(`已向【${ex.merchantName}】发送紧急接单语音电话与弹窗强提醒！`);
    setExceptions((prev) =>
      prev.map((item) =>
        item.id === ex.id
          ? { ...item, durationText: '已触发加急催单 (处理中)' }
          : item
      )
    );
  };

  const handleInterveneRefund = (ex: ExceptionItem) => {
    if (confirm(`确认要由平台介入为订单【${ex.orderNo}】执行极速全额退款吗？退款金额 ¥${ex.payAmount} 将原路退回买家账户。`)) {
      if (onInterveneRefund) {
        onInterveneRefund(ex.orderNo);
      }
      setExceptions((prev) =>
        prev.map((item) =>
          item.id === ex.id ? { ...item, status: 'refunded' } : item
        )
      );
      showFeedback(`订单【${ex.orderNo}】平台介入退款成功，款项已原路退回！`);
    }
  };

  const handleMarkResolved = (id: string) => {
    setExceptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'resolved' } : item))
    );
    showFeedback('异常已成功标记为已解决！');
  };

  return (
    <div className="space-y-4">
      {/* Top Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Query Toolbar & Top Actions (操作置顶在最上方) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Query Filters */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Search Input */}
            <div className="w-60 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索订单号 / 门店 / 描述..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部异常类型</option>
              <option value="accept_timeout">商家接单超时 (&gt;5min)</option>
              <option value="pickup_overdue">自提逾期未领 (&gt;48h)</option>
              <option value="stock_out">门店商品缺货</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部严重级别</option>
              <option value="high">紧急 (高)</option>
              <option value="medium">警告 (中)</option>
              <option value="low">提示 (低)</option>
            </select>

            {(searchText || filterType !== 'all' || severityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchText('');
                  setFilterType('all');
                  setSeverityFilter('all');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline cursor-pointer"
              >
                重置筛选
              </button>
            )}
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => showFeedback('已对所有待处理的超时订单执行一键并发智能加急催办！')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>一键批量加急催单</span>
            </button>

            <button
              onClick={() => showFeedback('已从履约监控中枢刷新最新异常列表！')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>刷新监控</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exception Table (内容自适应，左右滑动，操作全部以icon形式展示) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">订单号</th>
                <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">异常时间</th>
                <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">涉及商户</th>
                <th className="py-3 px-3 min-w-[180px] whitespace-nowrap">异常类型与级别</th>
                <th className="py-3 px-3 min-w-[120px] whitespace-nowrap">超时/滞留时长</th>
                <th className="py-3 px-3 min-w-[220px]">异常原因与影响描述</th>
                <th className="py-3 px-3 w-24 text-right whitespace-nowrap">订单金额</th>
                <th className="py-3 px-3 w-20 text-center whitespace-nowrap">状态</th>
                {/* 操作列固定在最右侧 */}
                <th className="py-3 px-4 w-36 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    当前暂无待处理的履约异常订单
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 订单号 (已删除 异常流水/ 字样) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-xs">{ex.orderNo}</div>
                    </td>

                    {/* 异常时间 (分开单独展示) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-600">{ex.orderTime}</div>
                    </td>

                    {/* 涉及商户 */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800 flex items-center space-x-1">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]" title={ex.merchantName}>{ex.merchantName}</span>
                      </div>
                    </td>

                    {/* 异常类型与级别：标签和文字展示两排 */}
                    <td className="py-3.5 px-3">
                      <div>
                        {/* 第一排：级别标签 */}
                        <div>
                          {ex.severity === 'high' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              高危
                            </span>
                          )}
                          {ex.severity === 'medium' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              警告
                            </span>
                          )}
                          {ex.severity === 'low' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              提示
                            </span>
                          )}
                        </div>
                        {/* 第二排：异常类型文字 */}
                        <div className="font-bold text-slate-900 text-xs mt-1 leading-snug" title={ex.typeName}>
                          {ex.typeName}
                        </div>
                      </div>
                    </td>

                    {/* 超时/滞留时长 (横版展示，不折行) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block whitespace-nowrap font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {ex.durationText}
                      </span>
                    </td>

                    {/* 异常原因与影响描述 */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="text-xs leading-relaxed max-w-xs line-clamp-2" title={ex.description}>
                        {ex.description}
                      </div>
                    </td>

                    {/* 订单金额 */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      ¥{ex.payAmount.toFixed(2)}
                    </td>

                    {/* 状态 */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {ex.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                          待处理
                        </span>
                      )}
                      {ex.status === 'resolved' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          已解决
                        </span>
                      )}
                      {ex.status === 'refunded' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/50">
                          已退款
                        </span>
                      )}
                    </td>

                    {/* 操作：全部icon展示，固定在最右侧 */}
                    <td className="py-3.5 px-4 text-right sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {ex.status === 'pending' ? (
                          <>
                            {ex.type === 'accept_timeout' && (
                              <button
                                onClick={() => handleUrgeMerchant(ex)}
                                title="催单 (紧急电话/弹窗提醒商家接单)"
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition cursor-pointer border border-amber-200/70"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleInterveneRefund(ex)}
                              title="平台介入极速全额退款"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer border border-rose-200/70"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleMarkResolved(ex.id)}
                              title="标记异常已解决"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer border border-emerald-200/70"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="p-1 text-slate-400 inline-flex items-center space-x-1" title="异常已闭环处理完成">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
