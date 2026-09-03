import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Order } from '../../types';

interface RiderWorkbenchProps {
  orders: Order[];
  onConfirmDelivered: (orderNo: string) => void;
}

export const RiderWorkbench: React.FC<RiderWorkbenchProps> = ({
  orders,
  onConfirmDelivered,
}) => {
  const [activeTab, setActiveTab] = useState<'delivering' | 'history'>('delivering');

  const deliveringOrders = orders.filter(
    (o) => o.fulfillType === 'delivery' && (o.orderStatus === 'delivering' || o.orderStatus === 'ready_delivery' || o.orderStatus === 'picking')
  );
  const finishedDeliveryOrders = orders.filter(
    (o) => o.fulfillType === 'delivery' && o.orderStatus === 'finished'
  );

  const todayIncome = finishedDeliveryOrders.reduce((sum, o) => sum + o.deliveryFee + (o.fulfillment.tipCount ? o.fulfillment.tipCount * 2 : 0), 0);

  return (
    <div className="flex-1 bg-[#F5F7FA] overflow-y-auto no-scrollbar pb-24 p-3.5 space-y-3.5">
      {/* Rider Top Header */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-800 to-slate-900 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-300 text-blue-900 flex items-center justify-center font-black text-lg shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-black tracking-tight">顺丰同城 · 张明峰</h1>
                <span className="text-[10px] bg-cyan-400/20 border border-cyan-400/50 text-cyan-200 px-1.5 py-0.2 rounded-full font-bold">
                  接单中
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 mt-0.5">工号：SF-3392 · 评分 4.98 分</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-cyan-200/80 block">今日配送收入</span>
            <span className="text-sm font-black text-amber-300 mt-0.5 block font-mono">¥{todayIncome.toFixed(2)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-cyan-200/80 block">配送中订单</span>
            <span className="text-sm font-black text-white mt-0.5 block font-mono">{deliveringOrders.length} 单</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-cyan-200/80 block">今日已送达</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block font-mono">{finishedDeliveryOrders.length} 单</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1 shadow-xs border border-gray-100 flex justify-between text-xs font-bold text-gray-600">
        <button
          onClick={() => setActiveTab('delivering')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'delivering' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          待送订单 ({deliveringOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-gray-50'
          }`}
        >
          今日已送达 ({finishedDeliveryOrders.length})
        </button>
      </div>

      {/* Order Cards */}
      {activeTab === 'delivering' ? (
        <div className="space-y-3">
          {deliveringOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs">
              暂无配送中的社区订单
            </div>
          ) : (
            deliveringOrders.map((o) => (
              <div key={o.orderNo} className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-xs font-mono font-bold text-gray-900">{o.orderNo}</span>
                  <span className="text-xs font-black text-rose-600">
                    配送费 ¥{o.deliveryFee} {o.fulfillment.tipCount ? `+小费¥${o.fulfillment.tipCount * 2}` : ''}
                  </span>
                </div>

                {/* Pickup & Destination */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      取
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{o.merchantName}</div>
                      <p className="text-[11px] text-gray-500">{o.merchantAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      送
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{o.address?.receiverName} · {o.address?.phone}</div>
                      <p className="text-[11px] text-gray-500">{o.address?.fullAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-2 bg-gray-50 rounded-xl text-[11px] text-gray-600">
                  {o.items.map((i) => `${i.titleSnapshot} x${i.quantity}`).join('，')}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => alert(`正在呼叫客户: ${o.address?.phone}`)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onConfirmDelivered(o.orderNo)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition shadow-sm flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>送达拍照 · 确认送达</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {finishedDeliveryOrders.map((o) => (
            <div key={o.orderNo} className="bg-white rounded-2xl p-3 border border-gray-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-800">{o.orderNo}</span>
                <p className="text-[10px] text-gray-400">{o.address?.fullAddress}</p>
              </div>
              <span className="font-mono font-bold text-emerald-600">+¥{o.deliveryFee}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
