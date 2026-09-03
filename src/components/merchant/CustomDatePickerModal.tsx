import React, { useState } from 'react';
import { X, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onConfirm: (startDate: string, endDate: string) => void;
}

const YEARS = ['2024', '2025', '2026', '2027'];
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

export const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  // Parse start / end dates
  const parseDate = (d: string) => {
    const parts = (d || '2026-08-27').split('-');
    return {
      year: parts[0] || '2026',
      month: parts[1] || '08',
      day: parts[2] || '27',
    };
  };

  const [startParts, setStartParts] = useState(parseDate(startDate || '2026-06-27'));
  const [endParts, setEndParts] = useState(parseDate(endDate || '2026-08-28'));

  if (!isOpen) return null;

  const currentParts = activeTab === 'start' ? startParts : endParts;
  const setCurrentParts = (updater: (prev: typeof startParts) => typeof startParts) => {
    if (activeTab === 'start') {
      setStartParts(updater);
    } else {
      setEndParts(updater);
    }
  };

  const formattedStartDate = `${startParts.year}-${startParts.month}-${startParts.day}`;
  const formattedEndDate = `${endParts.year}-${endParts.month}-${endParts.day}`;

  const handleConfirm = () => {
    onConfirm(formattedStartDate, formattedEndDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <div className="text-center flex-1">
            <h3 className="text-base font-black text-gray-900">自定义</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Title */}
        <div className="text-xs font-bold text-gray-600">自定义时间</div>

        {/* Date Range Boxes (Image 4 reference) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('start')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
              activeTab === 'start'
                ? 'border-[#00B578] bg-emerald-50/50 text-[#00B578] font-black'
                : 'border-gray-200 bg-gray-50 text-gray-700 font-medium'
            }`}
          >
            <div className="text-[10px] text-gray-400">开始时间</div>
            <div className="text-xs mt-0.5 font-mono font-bold">{formattedStartDate}</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('end')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
              activeTab === 'end'
                ? 'border-[#00B578] bg-emerald-50/50 text-[#00B578] font-black'
                : 'border-gray-200 bg-gray-50 text-gray-700 font-medium'
            }`}
          >
            <div className="text-[10px] text-gray-400">结束时间</div>
            <div className="text-xs mt-0.5 font-mono font-bold">{formattedEndDate}</div>
          </button>
        </div>

        {/* Wheel / Column Selectors (Year, Month, Day) */}
        <div className="bg-[#F8F9FB] rounded-2xl p-3 border border-gray-100">
          <div className="text-center text-[11px] text-gray-400 font-medium mb-2">
            正在选择 {activeTab === 'start' ? '开始日期' : '结束日期'}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Year Column */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400">年</span>
              <div className="h-28 overflow-y-auto no-scrollbar space-y-1 py-1 border-y border-gray-200/80">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setCurrentParts((p) => ({ ...p, year: y }))}
                    className={`w-full py-1 text-xs rounded-lg transition cursor-pointer ${
                      currentParts.year === y
                        ? 'bg-[#00B578] text-white font-black'
                        : 'text-gray-600 hover:bg-gray-200/60 font-medium'
                    }`}
                  >
                    {y}年
                  </button>
                ))}
              </div>
            </div>

            {/* Month Column */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400">月</span>
              <div className="h-28 overflow-y-auto no-scrollbar space-y-1 py-1 border-y border-gray-200/80">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCurrentParts((p) => ({ ...p, month: m }))}
                    className={`w-full py-1 text-xs rounded-lg transition cursor-pointer ${
                      currentParts.month === m
                        ? 'bg-[#00B578] text-white font-black'
                        : 'text-gray-600 hover:bg-gray-200/60 font-medium'
                    }`}
                  >
                    {m}月
                  </button>
                ))}
              </div>
            </div>

            {/* Day Column */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400">日</span>
              <div className="h-28 overflow-y-auto no-scrollbar space-y-1 py-1 border-y border-gray-200/80">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCurrentParts((p) => ({ ...p, day: d }))}
                    className={`w-full py-1 text-xs rounded-lg transition cursor-pointer ${
                      currentParts.day === d
                        ? 'bg-[#00B578] text-white font-black'
                        : 'text-gray-600 hover:bg-gray-200/60 font-medium'
                    }`}
                  >
                    {d}日
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: 确定 */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            确定
          </button>
        </div>
      </motion.div>
    </div>
  );
};
