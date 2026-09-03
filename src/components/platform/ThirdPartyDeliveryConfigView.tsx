import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Zap,
  Sliders,
  Send,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  DollarSign,
  Radio,
  Clock,
  Sparkles,
  Check,
  Search,
  Plus,
  Edit2,
  X,
  PlayCircle,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
  Power,
} from 'lucide-react';
import { MerchantConfig } from '../../types';

export interface MerchantDeliveryConfigItem {
  id: string;
  merchantName: string;
  storeAddress: string;
  wechatLogisticsEnabled: boolean; // 微信物流助手开关
  alipayDadaDirectEnabled: boolean; // 支付宝小程序达达直连开关
  channels: string[]; // ['wechat_logistics', 'dada_direct', 'sf_same_city', 'meituan_delivery']
  wechatAppId: string;
  wechatConnected: boolean;
  dadaSourceId: string;
  dadaShopId: string;
  dadaConnected: boolean;
  balance: number;
  dispatchStrategy: 'smart_lowest_price' | 'fastest_response' | 'multi_broadcast';
  autoCallDelivery: boolean;
  jointDebugStatus: 'connected' | 'testing' | 'unconfigured' | 'error';
  lastDebugTime: string;
  remark: string;
}

const INITIAL_MERCHANT_DELIVERIES: MerchantDeliveryConfigItem[] = [
  {
    id: 'MDC001',
    merchantName: '老街坊生鲜超市 (旗舰店)',
    storeAddress: '阳光花园小区东门 102 号商铺',
    wechatLogisticsEnabled: true,
    alipayDadaDirectEnabled: true,
    channels: ['wechat_logistics', 'dada_direct'],
    wechatAppId: 'wx8921f00a892b1120',
    wechatConnected: true,
    dadaSourceId: '7381920',
    dadaShopId: 'SHOP_001_A',
    dadaConnected: true,
    balance: 2450.0,
    dispatchStrategy: 'smart_lowest_price',
    autoCallDelivery: true,
    jointDebugStatus: 'connected',
    lastDebugTime: '2026-08-28 10:30:15',
    remark: '已联调微信物流助手（顺丰/达达/美团）及支付宝小程序达达直连，运力双重容灾',
  },
  {
    id: 'MDC002',
    merchantName: '悦家折扣生活超市 (二店)',
    storeAddress: '海棠湾社区商业中心 1 层 B-12',
    wechatLogisticsEnabled: true,
    alipayDadaDirectEnabled: false,
    channels: ['wechat_logistics'],
    wechatAppId: 'wx5512b99812a44567',
    wechatConnected: true,
    dadaSourceId: '',
    dadaShopId: '',
    dadaConnected: false,
    balance: 1820.5,
    dispatchStrategy: 'fastest_response',
    autoCallDelivery: true,
    jointDebugStatus: 'connected',
    lastDebugTime: '2026-08-28 09:12:00',
    remark: '接入微信物流助手，优先派发闪送与美团跑腿',
  },
  {
    id: 'MDC003',
    merchantName: '百年老字号牛肉面馆 (总店)',
    storeAddress: '春熙路社区步行街 38 号',
    wechatLogisticsEnabled: true,
    alipayDadaDirectEnabled: true,
    channels: ['wechat_logistics', 'dada_direct'],
    wechatAppId: 'wx3301ab9876ef1209',
    wechatConnected: true,
    dadaSourceId: '8910231',
    dadaShopId: 'SHOP_003_MAIN',
    dadaConnected: true,
    balance: 960.0,
    dispatchStrategy: 'multi_broadcast',
    autoCallDelivery: true,
    jointDebugStatus: 'connected',
    lastDebugTime: '2026-08-27 16:45:20',
    remark: '现制热食外送，开启多运力并发抢单保障出餐即送',
  },
  {
    id: 'MDC004',
    merchantName: '四季甜品与手作烘焙坊',
    storeAddress: '金桂名邸商业街南区 208 号',
    wechatLogisticsEnabled: true,
    alipayDadaDirectEnabled: false,
    channels: ['wechat_logistics'],
    wechatAppId: 'wx1102cd8899fa3451',
    wechatConnected: false,
    dadaSourceId: '',
    dadaShopId: '',
    dadaConnected: false,
    balance: 350.0,
    dispatchStrategy: 'smart_lowest_price',
    autoCallDelivery: false,
    jointDebugStatus: 'testing',
    lastDebugTime: '2026-08-26 14:20:00',
    remark: '待完成顺丰同城生鲜蛋糕专送签约联调验证',
  },
  {
    id: 'MDC005',
    merchantName: '晨光文具与便民数码店',
    storeAddress: '文苑雅居北门商铺 15 号',
    wechatLogisticsEnabled: false,
    alipayDadaDirectEnabled: false,
    channels: [],
    wechatAppId: '',
    wechatConnected: false,
    dadaSourceId: '',
    dadaShopId: '',
    dadaConnected: false,
    balance: 0.0,
    dispatchStrategy: 'smart_lowest_price',
    autoCallDelivery: false,
    jointDebugStatus: 'unconfigured',
    lastDebugTime: '-',
    remark: '暂仅支持到店自提，待配置第三方配送',
  },
];

interface ThirdPartyDeliveryConfigViewProps {
  merchants?: MerchantConfig[];
  onUpdateMerchantConfig?: (merchant: MerchantConfig) => void;
}

export const ThirdPartyDeliveryConfigView: React.FC<ThirdPartyDeliveryConfigViewProps> = () => {
  const [merchantDeliveries, setMerchantDeliveries] =
    useState<MerchantDeliveryConfigItem[]>(INITIAL_MERCHANT_DELIVERIES);
  const [searchText, setSearchText] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MerchantDeliveryConfigItem> | null>(null);

  // Test Dispatch Modal
  const [testingItem, setTestingItem] = useState<MerchantDeliveryConfigItem | null>(null);
  const [testResult, setTestResult] = useState<{
    running: boolean;
    logs: string[];
    success: boolean;
  } | null>(null);

  const filteredItems = merchantDeliveries.filter((item) => {
    const matchSearch =
      item.merchantName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.storeAddress.toLowerCase().includes(searchText.toLowerCase()) ||
      item.wechatAppId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.dadaSourceId.toLowerCase().includes(searchText.toLowerCase());

    const matchChannel =
      channelFilter === 'all' || item.channels.includes(channelFilter);

    const matchStatus =
      statusFilter === 'all' || item.jointDebugStatus === statusFilter;

    return matchSearch && matchChannel && matchStatus;
  });

  const handleOpenEdit = (item: MerchantDeliveryConfigItem) => {
    setEditingItem({ ...item });
    setShowConfigModal(true);
  };

  const handleOpenCreate = () => {
    setEditingItem({
      id: `MDC_${Date.now().toString().slice(-4)}`,
      merchantName: '',
      storeAddress: '',
      wechatLogisticsEnabled: true,
      alipayDadaDirectEnabled: false,
      channels: ['wechat_logistics'],
      wechatAppId: '',
      wechatConnected: false,
      dadaSourceId: '',
      dadaShopId: '',
      dadaConnected: false,
      balance: 1000.0,
      dispatchStrategy: 'smart_lowest_price',
      autoCallDelivery: true,
      jointDebugStatus: 'unconfigured',
      lastDebugTime: '-',
      remark: '',
    });
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    if (!editingItem?.merchantName?.trim()) {
      alert('请填写商户门店名称！');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const isNew = !merchantDeliveries.some((m) => m.id === editingItem.id);

    // 根据开关重新计算激活的 channels
    const activeChannels: string[] = [];
    if (editingItem.wechatLogisticsEnabled) {
      activeChannels.push('wechat_logistics');
    }
    if (editingItem.alipayDadaDirectEnabled) {
      activeChannels.push('dada_direct');
    }

    const updatedItem: MerchantDeliveryConfigItem = {
      id: editingItem.id || `MDC_${Date.now()}`,
      merchantName: editingItem.merchantName.trim(),
      storeAddress: editingItem.storeAddress || '社区商铺',
      wechatLogisticsEnabled: Boolean(editingItem.wechatLogisticsEnabled),
      alipayDadaDirectEnabled: Boolean(editingItem.alipayDadaDirectEnabled),
      channels: activeChannels,
      wechatAppId: editingItem.wechatLogisticsEnabled ? (editingItem.wechatAppId || '') : '',
      wechatConnected: Boolean(editingItem.wechatLogisticsEnabled && editingItem.wechatAppId),
      dadaSourceId: editingItem.alipayDadaDirectEnabled ? (editingItem.dadaSourceId || '') : '',
      dadaShopId: editingItem.alipayDadaDirectEnabled ? (editingItem.dadaShopId || '') : '',
      dadaConnected: Boolean(editingItem.alipayDadaDirectEnabled && editingItem.dadaSourceId),
      balance: Number(editingItem.balance) || 0,
      dispatchStrategy: editingItem.dispatchStrategy || 'smart_lowest_price',
      autoCallDelivery: Boolean(editingItem.autoCallDelivery),
      jointDebugStatus:
        (editingItem.wechatLogisticsEnabled && editingItem.wechatAppId) ||
        (editingItem.alipayDadaDirectEnabled && editingItem.dadaSourceId)
          ? 'connected'
          : 'unconfigured',
      lastDebugTime: now,
      remark: editingItem.remark || '商户联调参数已更新',
    };

    if (isNew) {
      setMerchantDeliveries((prev) => [updatedItem, ...prev]);
    } else {
      setMerchantDeliveries((prev) =>
        prev.map((m) => (m.id === updatedItem.id ? updatedItem : m))
      );
    }

    setShowConfigModal(false);
  };

  const handleStartJointTest = (item: MerchantDeliveryConfigItem) => {
    setTestingItem(item);
    setTestResult({
      running: true,
      logs: [
        `[${new Date().toLocaleTimeString()}] 🚀 正在初始化商户【${item.merchantName}】运力联调测试...`,
        `[${new Date().toLocaleTimeString()}] 📡 校验微信物流助手 AppID [${item.wechatAppId || '未配置'}] 握手协议...`,
      ],
      success: false,
    });

    setTimeout(() => {
      setTestResult((prev) => ({
        running: true,
        logs: [
          ...(prev?.logs || []),
          `[${new Date().toLocaleTimeString()}] 🔍 发起顺丰同城、美团配送、闪送、达达快送多运力预估价询价接口...`,
          `[${new Date().toLocaleTimeString()}] 💰 顺丰同城报价 ¥3.5 (12min上门) | 美团配送报价 ¥2.8 (10min上门) | 闪送报价 ¥4.0 (8min上门)`,
        ],
        success: false,
      }));
    }, 600);

    setTimeout(() => {
      setTestResult((prev) => ({
        running: false,
        logs: [
          ...(prev?.logs || []),
          `[${new Date().toLocaleTimeString()}] 🎯 智能派单引擎测试成功：按【最低价格优先】策略推荐美团配送 ¥2.8，预存账户余额充足！`,
          `[${new Date().toLocaleTimeString()}] ✅ 联调测试全部通过！商户运力接口联通正常。`,
        ],
        success: true,
      }));

      // Update merchant status
      setMerchantDeliveries((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? {
                ...m,
                jointDebugStatus: 'connected',
                lastDebugTime: new Date().toLocaleString('zh-CN', { hour12: false }),
              }
            : m
        )
      );
    }, 1300);
  };

  const handleToggleAutoCall = (id: string) => {
    setMerchantDeliveries((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, autoCallDelivery: !m.autoCallDelivery } : m
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Query Toolbar & Actions (操作置顶在最上方) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filters */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <div className="w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索商户名 / 门店地址 / AppID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部配送对接渠道</option>
              <option value="wechat_logistics">微信物流助手 (聚合4家)</option>
              <option value="dada_direct">达达快送直连</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">全部联调状态</option>
              <option value="connected">已联调连通</option>
              <option value="testing">联调测试中</option>
              <option value="unconfigured">未配置渠道</option>
              <option value="error">接口异常</option>
            </select>

            {(searchText || channelFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchText('');
                  setChannelFilter('all');
                  setStatusFilter('all');
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
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增商户联调配置</span>
            </button>

            <button
              onClick={() => {
                alert('已触发全平台商户配送接口联通性自检，全部商户运力通道已完成自动核验！');
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>一键全网联调自检</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-merchant Delivery Joint Debugging Table (内容自适应，左右滑动，操作固定在最右侧) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[1360px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200 whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[180px]">商户名称</th>
                <th className="py-3.5 px-3 min-w-[160px]">门店地址</th>
                <th className="py-3.5 px-3 min-w-[150px]">对接配送渠道</th>
                <th className="py-3.5 px-3 min-w-[150px]">微信物流助手</th>
                <th className="py-3.5 px-3 min-w-[130px]">达达直连 ID</th>
                <th className="py-3.5 px-3 min-w-[100px] text-right">运费预存余额</th>
                <th className="py-3.5 px-3 min-w-[120px]">智能派单策略</th>
                <th className="py-3.5 px-3 min-w-[90px] text-center">自动呼叫</th>
                <th className="py-3.5 px-3 min-w-[110px] text-center">联调状态</th>
                <th className="py-3.5 px-3 min-w-[140px]">最近联调时间</th>
                {/* 操作列固定在最右侧 */}
                <th className="py-3.5 px-4 min-w-[140px] text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    暂无匹配的商户配送联调配置数据
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 商户名称 (已删除编码) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]">{item.merchantName}</span>
                      </div>
                    </td>

                    {/* 门店地址 (已删除/商圈字样) */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="truncate max-w-[160px]" title={item.storeAddress}>
                        {item.storeAddress}
                      </div>
                    </td>

                    {/* 对接配送渠道 */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {item.channels.includes('wechat_logistics') && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            微信物流助手(4家)
                          </span>
                        )}
                        {item.channels.includes('dada_direct') && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            达达直连
                          </span>
                        )}
                        {item.channels.length === 0 && (
                          <span className="text-slate-400 text-[11px]">暂无外送对接</span>
                        )}
                      </div>
                    </td>

                    {/* 微信物流助手 */}
                    <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      {item.wechatLogisticsEnabled && item.wechatAppId ? (
                        <div>
                          <div className="text-slate-900 font-bold truncate max-w-[130px]" title={item.wechatAppId}>
                            {item.wechatAppId}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-sans">
                            ● 顺丰/闪送/美团/达达
                          </span>
                        </div>
                      ) : item.wechatLogisticsEnabled ? (
                        <span className="text-amber-600 font-sans text-[11px]">已开启未配置AppID</span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">已关闭通道</span>
                      )}
                    </td>

                    {/* 达达直连 ID */}
                    <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      {item.alipayDadaDirectEnabled && item.dadaSourceId ? (
                        <div>
                          <div className="text-slate-800 font-bold">{item.dadaSourceId}</div>
                          <div className="text-[10px] text-slate-400">{item.dadaShopId}</div>
                        </div>
                      ) : item.alipayDadaDirectEnabled ? (
                        <span className="text-amber-600 font-sans text-[11px]">已开启未配置ID</span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">已关闭直连</span>
                      )}
                    </td>

                    {/* 运费预存余额 */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="font-mono font-black text-slate-900">
                        ¥{item.balance.toFixed(2)}
                      </span>
                    </td>

                    {/* 智能派单策略 */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {item.dispatchStrategy === 'smart_lowest_price' && (
                        <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md inline-block whitespace-nowrap border border-emerald-100">
                          最低价格优先
                        </span>
                      )}
                      {item.dispatchStrategy === 'fastest_response' && (
                        <span className="text-sky-700 font-bold text-[11px] bg-sky-50 px-2.5 py-1 rounded-md inline-block whitespace-nowrap border border-sky-100">
                          极速响应优先
                        </span>
                      )}
                      {item.dispatchStrategy === 'multi_broadcast' && (
                        <span className="text-purple-700 font-bold text-[11px] bg-purple-50 px-2.5 py-1 rounded-md inline-block whitespace-nowrap border border-purple-100">
                          多运力并发抢单
                        </span>
                      )}
                    </td>

                    {/* 自动呼叫 */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAutoCall(item.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition whitespace-nowrap inline-block ${
                          item.autoCallDelivery
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.autoCallDelivery ? '已开启' : '已暂停'}
                      </button>
                    </td>

                    {/* 联调状态 */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {item.jointDebugStatus === 'connected' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                          已联调连通
                        </span>
                      )}
                      {item.jointDebugStatus === 'testing' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping shrink-0" />
                          联调中
                        </span>
                      )}
                      {item.jointDebugStatus === 'unconfigured' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 whitespace-nowrap">
                          未配置
                        </span>
                      )}
                      {item.jointDebugStatus === 'error' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 whitespace-nowrap">
                          接口异常
                        </span>
                      )}
                    </td>

                    {/* 最近联调时间 */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {item.lastDebugTime}
                    </td>

                    {/* 操作固定在最右侧 */}
                    <td className="py-3.5 px-4 text-right sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleStartJointTest(item)}
                          title="发起联调拨测"
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>联调测试</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="配置参数"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 商户联调参数配置弹窗 Modal */}
      {showConfigModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  商户配送联调与接口参数配置
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  配置各商户第三方运力通道 (微信物流助手 / 支付宝小程序达达直连) 及派单规则
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 text-xs font-medium text-slate-700">
              {/* 1. 商户基本信息 */}
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">
                  商户门店名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：老街坊生鲜超市"
                  value={editingItem.merchantName || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, merchantName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* 门店地址 */}
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">门店地址</label>
                <input
                  type="text"
                  placeholder="请输入门店自提/取件地址"
                  value={editingItem.storeAddress || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, storeAddress: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* 2. 微信物流助手配置 (增加独立开关) */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${editingItem.wechatLogisticsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="font-bold text-slate-900 text-xs">
                      微信物流助手 (一套接口对接顺丰/闪送/美团/达达)
                    </span>
                  </div>

                  {/* 微信物流助手开关 */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.wechatLogisticsEnabled)}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          wechatLogisticsEnabled: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {editingItem.wechatLogisticsEnabled ? '已开启' : '已关闭'}
                    </span>
                  </label>
                </div>

                {editingItem.wechatLogisticsEnabled ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">微信小程序 AppID</label>
                      <input
                        type="text"
                        placeholder="wx8921f00a892b1120"
                        value={editingItem.wechatAppId || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, wechatAppId: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">预存运费余额 (元)</label>
                      <input
                        type="number"
                        value={editingItem.balance ?? 0}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, balance: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-1">
                    已关闭微信物流助手通道，系统将不会向微信运力池派单。
                  </p>
                )}
              </div>

              {/* 3. 支付宝小程序达达直连配置 (增加独立开关) */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${editingItem.alipayDadaDirectEnabled ? 'bg-sky-500' : 'bg-slate-300'}`} />
                    <span className="font-bold text-slate-900 text-xs">
                      支付宝小程序达达直连 (达达官方直连通道)
                    </span>
                  </div>

                  {/* 支付宝小程序达达直连开关 */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.alipayDadaDirectEnabled)}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          alipayDadaDirectEnabled: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {editingItem.alipayDadaDirectEnabled ? '已开启' : '已关闭'}
                    </span>
                  </label>
                </div>

                {editingItem.alipayDadaDirectEnabled ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">达达商户号 (Source ID)</label>
                      <input
                        type="text"
                        placeholder="如 7381920"
                        value={editingItem.dadaSourceId || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, dadaSourceId: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">达达门店编号 (Shop ID)</label>
                      <input
                        type="text"
                        placeholder="如 SHOP_001_A"
                        value={editingItem.dadaShopId || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, dadaShopId: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-1">
                    已关闭支付宝小程序达达直连通道，系统将不会直接派发至达达独立商户号。
                  </p>
                )}
              </div>

              {/* 4. 智能派单调度策略 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1.5">智能派单调度引擎</label>
                  <select
                    value={editingItem.dispatchStrategy || 'smart_lowest_price'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        dispatchStrategy: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="smart_lowest_price">最低价格优先 (比价优选)</option>
                    <option value="fastest_response">极速响应优先 (接单时效最优)</option>
                    <option value="multi_broadcast">多运力并发抢单 (高峰期防压单)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1.5">自动呼叫第三方运力</label>
                  <select
                    value={editingItem.autoCallDelivery ? '1' : '0'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        autoCallDelivery: e.target.value === '1',
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="1">开启自动呼叫 (订单生成即派单)</option>
                    <option value="0">关闭自动呼叫 (需商户手动派单)</option>
                  </select>
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">联调说明与备注</label>
                <textarea
                  rows={2}
                  value={editingItem.remark || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, remark: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>保存联调配置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 联调测试控制台弹窗 Modal */}
      {testingItem && testResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 text-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  运力接口实时联调拨测 — {testingItem.merchantName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setTestingItem(null);
                  setTestResult(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Logs */}
            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs space-y-2 border border-slate-800/80 min-h-[160px] max-h-[260px] overflow-y-auto">
              {testResult.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('✅')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('💰')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
              {testResult.running && (
                <div className="flex items-center space-x-2 text-emerald-400 text-[11px] pt-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>正在与微信物流助手运力池进行毫秒级比价运算...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {testResult.success
                  ? '联调测试完成，接口通信响应耗时 128ms'
                  : '联调中...'}
              </span>
              <button
                onClick={() => {
                  setTestingItem(null);
                  setTestResult(null);
                }}
                disabled={testResult.running}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                完成关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
