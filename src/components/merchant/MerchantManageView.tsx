import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  X,
  CreditCard,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Store,
  Wallet,
  ArrowLeft,
  Coins,
  History,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MerchantConfig, MerchantBankCard } from '../../types';

interface MerchantManageViewProps {
  merchant: MerchantConfig;
  onUpdateMerchant: (updated: MerchantConfig) => void;
  onShowToast: (msg: string) => void;
  initialSubTab?: 'decor' | 'rebate' | 'withdraw' | 'bankcard';
}

export const MerchantManageView: React.FC<MerchantManageViewProps> = ({
  merchant,
  onUpdateMerchant,
  onShowToast,
  initialSubTab = 'decor',
}) => {
  const [subTab, setSubTab] = useState<'decor' | 'rebate' | 'withdraw' | 'bankcard'>(
    initialSubTab
  );

  // Subpage states
  const [showWithdrawPage, setShowWithdrawPage] = useState<boolean>(false);
  const [showWithdrawHistory, setShowWithdrawHistory] = useState<boolean>(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');

  // Form states for "店铺装修"
  const [businessHours, setBusinessHours] = useState<string>(
    merchant.businessHours || '06:00-22:00/全天'
  );
  const [category, setCategory] = useState<string>(merchant.category || '餐饮美食');
  const [phone, setPhone] = useState<string>(merchant.phone || '13870011223');
  const [doorImage, setDoorImage] = useState<string>(
    merchant.doorImage ||
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  );
  const [environmentImages, setEnvironmentImages] = useState<string[]>(
    merchant.environmentImages && merchant.environmentImages.length > 0
      ? merchant.environmentImages
      : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80']
  );
  const [description, setDescription] = useState<string>(merchant.description || '');

  // Form states for "福利配置"
  const [rebateRate, setRebateRate] = useState<number>(merchant.rebateRate || 10);

  // Form states for "账户提现"
  const [totalBalance, setTotalBalance] = useState<number>(merchant.balance || 24560.65);
  const [withdrawableAmount, setWithdrawableAmount] = useState<number>(
    merchant.withdrawableAmount || 1560.02
  );
  const [withdrawRecords, setWithdrawRecords] = useState<
    { id: string; time: string; amount: number; bank: string; status: string }[]
  >([
    {
      id: 'wr_001',
      time: '2026-05-20 14:30',
      amount: 5000.0,
      bank: '中国工商银行(7743)',
      status: '提现成功',
    },
    {
      id: 'wr_002',
      time: '2026-05-15 09:20',
      amount: 3200.0,
      bank: '中国工商银行(6212)',
      status: '提现成功',
    },
  ]);

  // Bank cards
  const [bankCards, setBankCards] = useState<MerchantBankCard[]>(
    merchant.bankCards || [
      {
        id: 'bc_1',
        bankName: '中国工商银行',
        cardNo: '**** 7743',
        holderName: '王思聪',
        branchName: '杭州文三支行',
        cardType: '借记卡',
        theme: 'emerald',
      },
      {
        id: 'bc_2',
        bankName: '中国工商银行',
        cardNo: '**** 6212',
        holderName: '王思聪',
        branchName: '南昌红谷滩支行',
        cardType: '借记卡',
        theme: 'gold',
      },
    ]
  );

  const handleSaveDecor = () => {
    onUpdateMerchant({
      ...merchant,
      businessHours,
      category,
      phone,
      doorImage,
      environmentImages,
      description,
    });
    onShowToast('店铺装修信息已成功保存！');
  };

  const handleSaveRebate = (newRate: number) => {
    setRebateRate(newRate);
    onUpdateMerchant({
      ...merchant,
      rebateRate: newRate,
    });
    onShowToast(`让利比例已更新为 ${newRate}%！`);
  };

  const handleExecuteWithdraw = () => {
    const num = parseFloat(withdrawAmountInput);
    if (isNaN(num) || num <= 0) {
      onShowToast('请输入有效的提现金额');
      return;
    }
    if (num > withdrawableAmount) {
      onShowToast('输入金额超出当前可提现额度');
      return;
    }

    setWithdrawableAmount((prev) => prev - num);
    setTotalBalance((prev) => prev - num);
    setWithdrawRecords((prev) => [
      {
        id: `wr_${Date.now()}`,
        time: new Date().toLocaleString(),
        amount: num,
        bank: '中国工商银行(6212)',
        status: '提现中 (已受理)',
      },
      ...prev,
    ]);
    setShowWithdrawPage(false);
    setWithdrawAmountInput('');
    onShowToast(`提现申请 ¥${num.toFixed(2)} 已提交，预计2小时内到账！`);
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden relative">
      {/* 1. Sub-page: 我要提现 (1:1 with Screenshot 2 - View 4) */}
      <AnimatePresence>
        {showWithdrawPage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-0 bg-[#F5F7FA] z-40 flex flex-col overflow-y-auto no-scrollbar"
          >
            {/* Nav Header */}
            <div className="bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowWithdrawPage(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-bold">我要提现</span>
              </button>
              <div className="w-16" />
            </div>

            <div className="p-3.5 space-y-3.5 pb-24">
              {/* Golden Gradient Summary Card (1:1 with Screenshot) */}
              <div className="bg-gradient-to-br from-[#FFF9E6] via-[#FFF3CC] to-[#FFEBB3] border border-[#FFE08A] rounded-2xl p-4 text-[#874D00] shadow-2xs">
                <span className="text-xs font-medium text-amber-900/80 block">
                  当前可提现金额
                </span>
                <span className="text-2xl font-black text-amber-950 mt-1 block font-sans">
                  {withdrawableAmount.toFixed(2)}
                </span>
              </div>

              {/* Withdraw Account Card */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-2">
                <span className="text-xs font-medium text-gray-500 block">
                  提现账户
                </span>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-[10px] border border-red-200">
                      工
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      中国工商银行(6212)
                    </span>
                  </div>
                  <Check className="w-4 h-4 text-[#00B578]" />
                </div>
              </div>

              {/* Withdraw Amount Input Card */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-3">
                <span className="text-xs font-medium text-gray-500 block">
                  提现金额
                </span>
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <span className="text-xl font-bold text-gray-900">¥</span>
                  <input
                    type="number"
                    value={withdrawAmountInput}
                    onChange={(e) => setWithdrawAmountInput(e.target.value)}
                    placeholder="请输入提现金额"
                    className="flex-1 text-base font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-gray-400">
                    当前可提现金额 ¥{withdrawableAmount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmountInput(withdrawableAmount.toString())}
                    className="text-[#1890FF] font-medium hover:underline cursor-pointer"
                  >
                    全部提现
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleExecuteWithdraw}
                className="w-full py-3.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-sm rounded-full shadow-md transition cursor-pointer mt-4"
                id="btn-apply-withdraw-submit"
              >
                申请提现
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top 4-Tab Pills Header (1:1 with Screenshot 2) */}
      <div className="bg-white px-3.5 py-2.5 border-b border-gray-100 shrink-0">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { id: 'decor', label: '店铺装修' },
            { id: 'rebate', label: '福利配置' },
            { id: 'withdraw', label: '账户提现' },
            { id: 'bankcard', label: '银行卡' },
          ].map((tab) => {
            const isSelected = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as any)}
                className={`py-1.5 rounded-lg text-xs transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#E8F8F2] text-[#00B578] font-black border border-[#00B578]/40 shadow-2xs'
                    : 'bg-[#F2F4F7] text-gray-600 font-medium hover:bg-gray-200/70'
                }`}
                id={`subtab-${tab.id}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-24 space-y-4">
        {/* ================= TAB 1: 店铺装修 (1:1 with Screenshot 2 Left) ================= */}
        {subTab === 'decor' && (
          <div className="space-y-4">
            {/* Section 1: 店铺信息装修 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block px-1">
                店铺信息装修
              </span>
              <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-3">
                {/* 营业时间段 */}
                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-xs text-gray-700 font-medium">
                    <span className="text-rose-500 font-bold mr-0.5">*</span>
                    营业时间段
                  </span>
                  <input
                    type="text"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="如:06:00-22:00/全天"
                    className="text-xs text-right text-gray-800 placeholder:text-gray-300 outline-none max-w-[180px] bg-transparent"
                  />
                </div>

                {/* 经营所属分类 */}
                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-xs text-gray-700 font-medium">
                    <span className="text-rose-500 font-bold mr-0.5">*</span>
                    经营所属分类
                  </span>
                  <div className="flex items-center space-x-1">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-xs text-gray-800 bg-transparent outline-none cursor-pointer"
                    >
                      <option value="餐饮美食">餐饮美食</option>
                      <option value="生鲜果蔬">生鲜果蔬</option>
                      <option value="超市便利">超市便利</option>
                      <option value="甜品饮品">甜品饮品</option>
                      <option value="日用百货">日用百货</option>
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                {/* 联系电话 */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-700 font-medium">
                    <span className="text-rose-500 font-bold mr-0.5">*</span>
                    联系电话
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入联系电话"
                    className="text-xs text-right text-gray-800 placeholder:text-gray-300 outline-none max-w-[180px] bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: 请上传门头照片 (限1张) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block px-1">
                请上传门头照片 <span className="text-gray-400 font-normal">(限1张)</span>
              </span>
              <div className="flex items-center space-x-3">
                {doorImage ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs group">
                    <img
                      src={doorImage}
                      alt="门头照片"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setDoorImage('')}
                      className="absolute top-1 right-1 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      setDoorImage(
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: 请上传店内环境照片 (限2张) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block px-1">
                请上传店内环境照片 <span className="text-gray-400 font-normal">(限2张)</span>
              </span>
              <div className="flex items-center space-x-3">
                {environmentImages.length < 2 && (
                  <div
                    onClick={() => {
                      setEnvironmentImages((prev) => [
                        ...prev,
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
                      ]);
                    }}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                )}

                {environmentImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs"
                  >
                    <img
                      src={img}
                      alt={`环境照片 ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEnvironmentImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: 店铺介绍 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block px-1">
                店铺介绍
              </span>
              <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  placeholder="请输入店铺介绍，如特色招牌菜品、历史渊源、服务承诺等..."
                  rows={4}
                  className="w-full text-xs text-gray-800 placeholder:text-gray-300 outline-none resize-none bg-transparent"
                />
                <div className="text-right text-[10px] text-gray-400">
                  {description.length}/200
                </div>
              </div>
            </div>

            {/* Save Button (1:1 with Screenshot 2) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveDecor}
                className="w-full py-3.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-sm rounded-full shadow-md transition cursor-pointer"
                id="btn-save-decor"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: 福利配置 (1:1 with Screenshot 2 View 2) ================= */}
        {subTab === 'rebate' && (
          <div className="space-y-4">
            {/* Orange Notice Banner */}
            <div className="bg-[#FFF8EE] border border-[#FFE8CC] rounded-2xl p-3.5 text-[#FF7A00] text-xs leading-relaxed shadow-2xs">
              商户可以自主设置让利比例。消费者在您的店铺下单后，平台分账结算协议将按该比例全自动结算分润，实时进行让利。
            </div>

            {/* Config Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block px-1">
                店铺福利配置
              </span>
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-gray-700">
                    <span className="text-rose-500 font-bold mr-0.5">*</span>
                    让利比例
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSaveRebate(Math.max(3, rebateRate - 1))}
                      className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-[#00B578] min-w-[36px] text-center">
                      {rebateRate}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveRebate(Math.min(30, rebateRate + 1))}
                      className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={rebateRate}
                  onChange={(e) => handleSaveRebate(parseInt(e.target.value, 10))}
                  className="w-full accent-[#00B578] cursor-pointer"
                />

                {/* Pink Warning Pill (1:1 with Screenshot) */}
                <div className="bg-[#FFF0F0] text-[#FF4D4F] border border-[#FFD0D0] text-center text-xs py-1.5 rounded-lg mt-2 font-medium">
                  让利下限：3%，让利上限：30%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 账户提现 (1:1 with Screenshot 2 View 3) ================= */}
        {subTab === 'withdraw' && (
          <div className="space-y-4">
            {/* White Balance Card with Watermark Graphic */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-100 space-y-4 relative overflow-hidden">
              {/* Coin Watermark */}
              <div className="absolute right-3 top-3 text-gray-100 pointer-events-none opacity-80">
                <Coins className="w-20 h-20 text-gray-200/50" />
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 block">
                  可提现金额
                </span>
                <span className="text-[28px] font-black text-gray-900 mt-1 block font-sans tracking-tight leading-none">
                  {totalBalance.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons (1:1 with Screenshot) */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawHistory(true)}
                  className="flex-1 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition cursor-pointer shadow-2xs"
                  id="btn-withdraw-history"
                >
                  提现记录
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawPage(true)}
                  className="flex-1 py-2 rounded-full bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  id="btn-go-withdraw"
                >
                  我要提现
                </button>
              </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
              {showWithdrawHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[80vh] flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                        <History className="w-4 h-4 text-emerald-600" />
                        <span>提现记录明细</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWithdrawHistory(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {withdrawRecords.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1 border border-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">
                              提现至 {item.bank}
                            </span>
                            <span className="font-black text-rose-600 text-sm">
                              -¥{item.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[10px]">
                            <span>{item.time}</span>
                            <span className="text-emerald-600 font-bold">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ================= TAB 4: 银行卡 (1:1 with Screenshot 2 View 5) ================= */}
        {subTab === 'bankcard' && (
          <div className="space-y-3.5">
            {/* Card 1: Emerald/Jade Premium Card (1:1 with Screenshot) */}
            <div className="bg-gradient-to-r from-[#175C3B] via-[#1E6F4A] to-[#2B8259] text-white rounded-2xl p-4 shadow-md relative overflow-hidden space-y-4">
              {/* Top Row: Name, Card No, Bank */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold tracking-tight">王思聪</span>
                  <span className="text-xs font-mono tracking-wider font-bold">
                    **** 7743
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-white/90 text-xs font-medium cursor-pointer">
                  <span>中国工商银行</span>
                  <Edit2 className="w-3 h-3" />
                </div>
              </div>

              {/* Bottom Row: Branch Name & Card Type Badge */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-white/80">联行号：杭州文三支行</span>
                <span className="text-[10px] bg-black/20 border border-white/20 px-2 py-0.5 rounded-full font-bold">
                  借记卡
                </span>
              </div>
            </div>

            {/* Card 2: Golden Metallic Card (1:1 with Screenshot) */}
            <div className="bg-gradient-to-r from-[#DFB86C] via-[#CDA04E] to-[#B8860B] text-white rounded-2xl p-4 shadow-md relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold tracking-tight">王思聪</span>
                  <span className="text-xs font-mono tracking-wider font-bold">
                    **** 6212
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-white/90 text-xs font-medium cursor-pointer">
                  <span>中国工商银行</span>
                  <Edit2 className="w-3 h-3" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-white/80">联行号：南昌红谷滩支行</span>
                <span className="text-[10px] bg-black/20 border border-white/20 px-2 py-0.5 rounded-full font-bold">
                  借记卡
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
