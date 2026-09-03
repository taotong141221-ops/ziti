import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ShieldCheck, AlertCircle, FileText, Search, ArrowRight, Layers } from 'lucide-react';

export const PrdDocViewer: React.FC = () => {
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const prdItems = [
    { id: 'PRD-01', module: 'C端-双履约', title: '到店自提与社区配送双模式切换', desc: '店内顶部提供自提与配送Tab，切换时实时重算起送价、满免门槛与配送费', level: 'P0 必做' },
    { id: 'PRD-02', module: 'C端-结算', title: '3km 配送范围与起送价校验', desc: '配送模式下严格校验收货地址与门店距离（≤3km）及起送金额（¥15~¥25），差额红字提示', level: 'P0 必做' },
    { id: 'PRD-03', module: 'C端-积分', title: '福利账户 PV 积分抵扣与让利累计', desc: '消费支持按比例使用积分抵扣现金；履约完成后商品实付金额按比例返还积分并计入五级会员', level: 'P0 必做' },
    { id: 'PRD-04', module: 'C端-履约', title: '6位数字防截屏自提核销码与加密二维码', desc: '到店自提生成唯一6位核销码与动态token二维码，商家扫码验真后标记完成', level: 'P0 必做' },
    { id: 'PRD-05', module: 'C端-配送', title: '高德风格同城配送实时轨迹与追加小费', desc: '骑手接单后展示实时配送坐标动效、骑手姓名电话；支持恶劣天气追加小费（≤2次）', level: 'P0 必做' },
    { id: 'PRD-06', module: 'B端-接单', title: '5分钟语音接单播报与拒单全额退款', desc: '新订单10s内语音播报；5分钟未接单或主动拒单触发全额原路退款与库存原子回滚', level: 'P0 必做' },
    { id: 'PRD-07', module: 'B端-核销', title: '自提核销台（输入6位码/扫码/手机尾号）', desc: '防重放攻击与并发冲突校验，核销成功即刻释放货款并触发T+1结算', level: 'P0 必做' },
    { id: 'PRD-08', module: '资金-分账', title: '五方延时分账零误差拆解机制', desc: '支付时资金冻结，履约后拆解给配送方、平台佣金(3%)、推广专员(2%)、推荐收益(1%)、商家货款', level: 'P0 必做' },
    { id: 'PRD-09', module: '资金-退款', title: '售后取货前后差异化退费规则', desc: '骑手取货前申请售后全额退付；取货后申请退款扣除已产生配送费，退款逆向回退分账与积分', level: 'P0 必做' },
    { id: 'PRD-10', module: '平台-风控', title: '佣金抽成区间校验（2%~5%）与类目覆盖', desc: '平台默认抽成3%，支持按类目与区域个性化覆盖，优先级：类目 > 区域 > 全局', level: 'P0 必做' },
  ];

  const filtered = prdItems.filter((item) => {
    if (filterTag !== 'all' && item.module !== filterTag) return false;
    if (searchQuery.trim() && !item.title.includes(searchQuery) && !item.desc.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar p-5 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>社区购模块研发级 PRD 核心需求矩阵 (v2.0)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            对齐《需求库·43条验收标准》：轻模式现货商城 + 双履约 + 五方延时分账
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex space-x-1.5 text-xs">
          {['all', 'C端-双履约', 'C端-结算', 'C端-履约', 'B端-接单', 'B端-核销', '资金-分账'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                filterTag === t ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'all' ? '全部需求' : t}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="搜索需求条目 / 规则..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs p-1.5 pl-7 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
        </div>
      </div>

      {/* PRD Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {item.id} · {item.module}
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                {item.level}
              </span>
            </div>
            <h3 className="text-xs font-black text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
