import React from 'react';
import { Wifi, BatteryMedium, MoreHorizontal, CircleDot, Home } from 'lucide-react';

interface MiniProgramFrameProps {
  children: React.ReactNode;
  title?: string;
  showCapsule?: boolean;
  navBgClass?: string;
  titleColorClass?: string;
  onBack?: () => void;
  showBack?: boolean;
  onGoHome?: () => void;
  showHome?: boolean;
  currentRoleName?: string;
  onOpenRoleSwitch?: () => void;
}

export const MiniProgramFrame: React.FC<MiniProgramFrameProps> = ({
  children,
  title,
  showCapsule = true,
  navBgClass = 'bg-white',
  titleColorClass = 'text-gray-900',
  onBack,
  showBack = false,
  onGoHome,
  showHome = false,
  currentRoleName,
  onOpenRoleSwitch,
}) => {
  return (
    <div className="w-[390px] min-w-[390px] max-w-[390px] h-[844px] shrink-0 bg-[#F5F7FA] rounded-[48px] shadow-2xl overflow-hidden flex flex-col border-[10px] border-gray-900 relative select-none">
      {/* iPhone 14 Notch / Camera cutout */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-50 pointer-events-none" />

      {/* Mini-Program Top Status Bar */}
      <div className="pt-3 px-6 pb-1.5 flex justify-between items-center text-xs font-semibold text-gray-800 bg-transparent z-40">
        <span className="tracking-tight text-xs font-bold font-mono">9:41</span>
        <div className="flex items-center space-x-1.5 opacity-90">
          <span className="text-[10px] font-bold">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>

      {/* Mini-Program Navigation Bar + Role Pill + WeChat Capsule */}
      <div className={`px-3.5 py-1.5 flex items-center justify-between z-40 transition-colors border-b border-gray-100/50 ${navBgClass}`}>
        <div className="flex items-center min-w-[56px] space-x-1">
          {showBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-gray-700 hover:bg-black/5 rounded-full transition cursor-pointer flex items-center"
              id="btn-nav-back"
              title="返回上一页"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {showHome && (
            <button
              onClick={onGoHome}
              className="p-1.5 text-gray-700 hover:bg-black/5 rounded-full transition cursor-pointer flex items-center"
              id="btn-nav-home"
              title="返回首页"
            >
              <Home className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>

        <div className={`text-sm font-black text-center truncate px-1 flex-1 ${titleColorClass}`}>
          {title}
        </div>

        {showCapsule ? (
          <div className="bg-black/5 backdrop-blur-md rounded-full px-2 py-1 flex items-center space-x-1.5 border border-black/10 text-gray-700">
            <MoreHorizontal
              onClick={onOpenRoleSwitch}
              className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
              title="切换身份 / 菜单"
            />
            <div className="w-px h-2.5 bg-gray-400/50" />
            <CircleDot className="w-3.5 h-3.5 text-emerald-600 cursor-pointer hover:opacity-80" />
          </div>
        ) : (
          <div className="min-w-[50px]" />
        )}
      </div>

      {/* Main Screen Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        {children}
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-full bg-transparent py-1.5 flex justify-center z-50 pointer-events-none">
        <div className="w-32 h-1 bg-gray-400 rounded-full" />
      </div>
    </div>
  );
};
