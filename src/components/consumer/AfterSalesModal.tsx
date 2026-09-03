import React, { useState, useRef } from 'react';
import { X, ImagePlus, Trash2, ShoppingBag, RotateCcw, RefreshCw, PackageX, AlertCircle, Store, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';

export type ConsumerAfterSalesType = 'refund' | 'exchange' | 'return';

interface AfterSalesModalProps {
  order: Order | null;
  onClose: () => void;
  onSubmitAfterSales: (
    orderNo: string,
    reason: string,
    refundType: string,
    exchangeOptions?: {
      exchangeType?: 'store_exchange';
      exchangeSpec?: string;
      description?: string;
      overdueServiceFee?: number;
      netRefundAmount?: number;
      overdueFeeRate?: number;
      isOverdue?: boolean;
      images?: string[];
      returnMethod?: 'store_return' | 'delivery_return';
    }
  ) => void;
}

export const AfterSalesModal: React.FC<AfterSalesModalProps> = ({
  order,
  onClose,
  onSubmitAfterSales,
}) => {
  if (!order) return null;

  const isOverdue = !!order.isOverduePickup;
  const [serviceType, setServiceType] = useState<ConsumerAfterSalesType>('refund');

  // Reason for each service type
  const [reason, setReason] = useState<string>(
    isOverdue ? '超过预约自提时间未提货，申请退款' : '选错商品/规格，重新下单'
  );
  const [exchangeTargetSpec, setExchangeTargetSpec] = useState<string>('');
  const [returnMethod, setReturnMethod] = useState<'store_return' | 'delivery_return'>('store_return');
  const [description, setDescription] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const feeRate = order.overdueFeeRate || 10;
  const serviceFee = isOverdue && serviceType === 'refund'
    ? Number(((order.payAmount * feeRate) / 100).toFixed(2))
    : 0;
  const netRefundAmount = isOverdue && serviceType === 'refund'
    ? Number(Math.max(0, order.payAmount - serviceFee).toFixed(2))
    : Number(order.payAmount.toFixed(2));

  // Reason presets
  const refundReasons = isOverdue
    ? [
        '超过预约自提时间未提货，申请退款',
        '临时有事无法按时到店自提',
        '距离门店较远/行程变更',
        '已重新选购其他商品',
        '其他原因申请退款',
      ]
    : [
        '选错商品/规格，重新下单',
        '计划有变无需到店自提',
        '与商家沟通一致申请退款',
        '自提点距离较远/行程冲突',
        '其他原因协商退款',
      ];

  const exchangeReasons = [
    '商品规格选错，希望调换同款其他规格',
    '想调换店内同等价值的其他商品',
    '口味偏好调整（换微辣/免葱/原味等）',
    '与店员已电话沟通好到店现场换货',
    '其他原因调换商品',
  ];

  const returnReasons = [
    '商品质量不符预期或存在瑕疵',
    '包装破损/汤汁溢出/密封不严',
    '餐品制作错误，与订单描述不一致',
    '到店后未按预约时间出餐，无法等待',
    '与商家沟通一致申请退货退款',
    '其他原因退货',
  ];

  // When changing serviceType, sync default reason
  const handleTypeChange = (type: ConsumerAfterSalesType) => {
    setServiceType(type);
    if (type === 'refund') {
      setReason(isOverdue ? '超过预约自提时间未提货，申请退款' : '选错商品/规格，重新下单');
    } else if (type === 'exchange') {
      setReason('商品规格选错，希望调换同款其他规格');
    } else {
      setReason('商品质量不符预期或存在瑕疵');
    }
  };

  // Sample image pool for simulated upload
  const sampleVouchers = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && uploadedImages.length < 4) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSampleImage = () => {
    if (uploadedImages.length < 4) {
      const nextImg = sampleVouchers[uploadedImages.length % sampleVouchers.length];
      setUploadedImages((prev) => [...prev, nextImg]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmitAfterSales(order.orderNo, reason, serviceType, {
      exchangeType: 'store_exchange',
      exchangeSpec: exchangeTargetSpec,
      description,
      overdueServiceFee: serviceFee,
      netRefundAmount: serviceType === 'exchange' ? 0 : netRefundAmount,
      overdueFeeRate: feeRate,
      isOverdue,
      images: uploadedImages,
      returnMethod,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 max-h-[92vh] w-full max-w-lg flex flex-col shadow-2xl space-y-3.5 my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-gray-900">申请售后</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200/60">
                到店自提
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              订单号: {order.orderNo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Responsive Scroll */}
        <div className="space-y-3.5 overflow-y-auto no-scrollbar flex-1 pr-0.5 text-xs">
          {/* 1. 售后类型选择 (退款, 换货, 退货 三大逻辑) */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5">
              售后服务类型 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Type 1: 退款 */}
              <button
                type="button"
                onClick={() => handleTypeChange('refund')}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  serviceType === 'refund'
                    ? 'bg-rose-50/80 border-rose-400 text-rose-900 shadow-xs ring-1 ring-rose-400'
                    : 'bg-gray-50/60 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RotateCcw className={`w-4 h-4 ${serviceType === 'refund' ? 'text-rose-600' : 'text-gray-400'}`} />
                  {serviceType === 'refund' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">仅退款</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">未提货直接退款</div>
                </div>
              </button>

              {/* Type 2: 换货 */}
              <button
                type="button"
                onClick={() => handleTypeChange('exchange')}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  serviceType === 'exchange'
                    ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs ring-1 ring-blue-400'
                    : 'bg-gray-50/60 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RefreshCw className={`w-4 h-4 ${serviceType === 'exchange' ? 'text-blue-600' : 'text-gray-400'}`} />
                  {serviceType === 'exchange' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">到店换货</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">更换商品或规格</div>
                </div>
              </button>

              {/* Type 3: 退货 */}
              <button
                type="button"
                onClick={() => handleTypeChange('return')}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  serviceType === 'return'
                    ? 'bg-orange-50/80 border-orange-400 text-orange-900 shadow-xs ring-1 ring-orange-400'
                    : 'bg-gray-50/60 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <PackageX className={`w-4 h-4 ${serviceType === 'return' ? 'text-orange-600' : 'text-gray-400'}`} />
                  {serviceType === 'return' && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">退货退款</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">退还商品并退款</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. 申请原因 (依据类型联动) */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5">
              {serviceType === 'refund' ? '退款原因' : serviceType === 'exchange' ? '换货原因' : '退货原因'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white text-gray-800 font-medium"
            >
              {(serviceType === 'refund' ? refundReasons : serviceType === 'exchange' ? exchangeReasons : returnReasons).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 换货专有字段: 期望调换的商品/规格 */}
          {serviceType === 'exchange' && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3 space-y-2">
              <label className="text-xs font-bold text-blue-900 block">
                期望调换的新商品或规格说明
              </label>
              <input
                type="text"
                value={exchangeTargetSpec}
                onChange={(e) => setExchangeTargetSpec(e.target.value)}
                placeholder="例如: 调换为豪华加肉加蛋大碗，或换牛肉面套餐..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-blue-200 bg-white text-gray-800 outline-none focus:border-blue-500 font-medium"
              />
              <div className="text-[11px] text-blue-700 flex items-start space-x-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>换货申请审核通过后，请前往门店自提点出示订单核销。商品若有差价，可在门店现场多退少补。</span>
              </div>
            </div>
          )}

          {/* 4. 退货专有字段: 退货方式 */}
          {serviceType === 'return' && (
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3 space-y-2">
              <label className="text-xs font-bold text-orange-900 block">
                退货方式选择
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReturnMethod('store_return')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1 ${
                    returnMethod === 'store_return'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>到店退还商品</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReturnMethod('delivery_return')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1 ${
                    returnMethod === 'delivery_return'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  <PackageX className="w-3.5 h-3.5" />
                  <span>同城寄回/闪送</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. 补充说明 (选填) */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5">
              补充说明 (选填)
            </label>
            <textarea
              rows={2}
              placeholder="请填写详细情况或留言给门店商户..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white text-gray-800 resize-none"
            />
          </div>

          {/* 6. 上传凭证图片 (选填) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800">
                上传凭证图片 (选填)
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {uploadedImages.length}/4
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                  <img
                    src={img}
                    alt={`凭证 ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-0.8 rounded-full transition cursor-pointer"
                    title="删除图片"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {uploadedImages.length < 4 && (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                  >
                    <ImagePlus className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px]">上传图片</span>
                  </button>

                  {uploadedImages.length === 0 && (
                    <button
                      type="button"
                      onClick={handleAddSampleImage}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200/80 transition cursor-pointer"
                    >
                      添加示例凭证
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              可上传商品照片、小票或问题凭证，最多支持 4 张图片
            </p>
          </div>

          {/* 7. 金额与退换说明卡片 */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>原订单实付金额:</span>
              <span className="font-mono font-bold text-gray-900">
                ¥{order.payAmount.toFixed(2)}
              </span>
            </div>

            {serviceType === 'refund' && isOverdue && (
              <div className="flex justify-between items-center text-xs text-amber-700">
                <span>扣除超时备货服务费 ({feeRate}%):</span>
                <span className="font-mono font-bold">-¥{serviceFee.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-gray-200/80 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-900">
                {serviceType === 'exchange' ? '换货凭据金额:' : '预计退款到账:'}
              </span>
              <span className={`text-base font-black font-mono ${serviceType === 'exchange' ? 'text-blue-600' : 'text-rose-600'}`}>
                ¥{serviceType === 'exchange' ? order.payAmount.toFixed(2) : netRefundAmount.toFixed(2)}
              </span>
            </div>
            {serviceType === 'exchange' && (
              <p className="text-[10px] text-gray-400">
                换货不直接退款，原实付金额保留作为到店换货凭证，差价现场多退少补
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex space-x-2 pt-2 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
            id="btn-confirm-submit-aftersales"
          >
            确认提交申请
          </button>
        </div>
      </div>
    </div>
  );
};
