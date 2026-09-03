import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { DeliveryAddressItem } from '../../types';

interface AddressListViewProps {
  addresses: DeliveryAddressItem[];
  onBack: () => void;
  onSelectAddress?: (address: DeliveryAddressItem) => void;
  onAddAddress: (newAddr: Omit<DeliveryAddressItem, 'id'>) => void;
  onUpdateAddress: (addr: DeliveryAddressItem) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
}

const PRESET_TAGS = ['家', '公司', '父母家', '学校', '其他'];

const QUICK_ADDRESS_PRESETS = [
  '江西省南昌市红谷滩区绿茵路绿地中央广场A座',
  '江西省南昌市红谷滩区金融大街999号金融中心B座',
  '江西省南昌市红谷滩区红谷中大道1398号万达星城',
  '江西省南昌市红谷滩区春晖路66号联发江岸汇景',
  '江西省南昌市红谷滩区世贸路898号博能中心',
];

export const AddressListView: React.FC<AddressListViewProps> = ({
  addresses,
  onBack,
  onSelectAddress,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressItem | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formTag, setFormTag] = useState<string>('家');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formDetail, setFormDetail] = useState<string>('');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormName('Ella');
    setFormPhone('13725655698');
    setFormTag('家');
    setFormAddress('江西省南昌市红谷滩区绿茵路绿地中央广场A座');
    setFormDetail('');
    setFormIsDefault(addresses.length === 0);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (addr: DeliveryAddressItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormTag(addr.tag || '家');
    setFormAddress(addr.address);
    setFormDetail(addr.detail || '');
    setFormIsDefault(addr.isDefault);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      setFormError('请填写收货人姓名');
      return;
    }
    if (!formPhone.trim() || !/^1\d{10}$/.test(formPhone.trim())) {
      setFormError('请填写有效的11位手机号码');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('请填写详细地址');
      return;
    }

    const fullAddr = formDetail.trim()
      ? `${formAddress.trim()} ${formDetail.trim()}`
      : formAddress.trim();

    if (editingAddress) {
      onUpdateAddress({
        ...editingAddress,
        name: formName.trim(),
        phone: formPhone.trim(),
        tag: formTag,
        address: fullAddr,
        detail: formDetail.trim(),
        isDefault: formIsDefault,
      });
    } else {
      onAddAddress({
        name: formName.trim(),
        phone: formPhone.trim(),
        tag: formTag,
        address: fullAddr,
        detail: formDetail.trim(),
        isDefault: formIsDefault || addresses.length === 0,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认删除该收货地址吗？')) {
      onDeleteAddress(id);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-hidden">
      {/* Address List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3 pb-24">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3 mt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <p className="text-sm font-black text-gray-800">暂无保存的收货地址</p>
            <p className="text-xs text-gray-400">添加收货地址，下单支持顺丰同城急送直达</p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs hover:bg-emerald-700 transition cursor-pointer"
            >
              立即新增地址
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelectAddress && onSelectAddress(addr)}
              className={`bg-white rounded-2xl p-4 border transition cursor-pointer space-y-3 shadow-2xs relative ${
                addr.isDefault
                  ? 'border-emerald-200/90 ring-1 ring-emerald-100'
                  : 'border-gray-100 hover:border-emerald-200'
              }`}
              id={`address-item-${addr.id}`}
            >
              {/* Top row: Name, Phone, Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-gray-900">{addr.name}</span>
                  <span className="text-xs font-bold text-gray-600">{addr.phone}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {addr.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100/80">
                      {addr.tag}
                    </span>
                  )}
                  {addr.isDefault && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center space-x-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>默认</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Full Address */}
              <div className="text-xs text-gray-700 leading-relaxed pr-2 font-medium flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="flex-1">{addr.address}</span>
              </div>

              {/* Bottom: Action bar */}
              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefaultAddress(addr.id);
                  }}
                  className={`flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold transition ${
                    addr.isDefault
                      ? 'text-emerald-700 font-black'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      addr.isDefault
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {addr.isDefault && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{addr.isDefault ? '默认地址' : '设为默认'}</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => openEditModal(addr, e)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 font-medium transition cursor-pointer text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>编辑</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(addr.id, e)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-rose-600 font-medium transition cursor-pointer text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Bottom Fixed Button */}
      <div className="p-3 bg-white border-t border-gray-100 shadow-lg shrink-0">
        <button
          onClick={openAddModal}
          className="w-full py-3 bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black rounded-2xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.99]"
          id="btn-add-address-bottom"
        >
          <Plus className="w-4 h-4" />
          <span>新建收货地址</span>
        </button>
      </div>

      {/* 4. Add / Edit Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4.5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-900">
                {editingAddress ? '编辑收货地址' : '新增收货地址'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="my-2.5 p-2 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold border border-rose-100">
                ⚠️ {formError}
              </div>
            )}

            {/* Form Fields */}
            <div className="py-3 space-y-3 text-xs">
              {/* Receiver Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  收货人姓名 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="请输入收货人姓名 (如: Ella)"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  手机号码 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="请输入11位手机号码"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">地址标签</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormTag(tag)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                        formTag === tag
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-600">
                    所在地区与楼宇 <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 flex items-center space-x-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>快捷商圈</span>
                  </span>
                </div>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="如: 江西省南昌市红谷滩区绿茵路绿地中央广场A座"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 text-xs font-medium"
                  />
                </div>

                {/* Quick chip selector */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {QUICK_ADDRESS_PRESETS.slice(0, 3).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAddress(preset)}
                      className="text-[10px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 px-2 py-0.5 rounded-md transition text-left truncate max-w-full"
                    >
                      + {preset.split('红谷滩区')[1] || preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed room */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  门牌号 / 详细位置
                </label>
                <input
                  type="text"
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="例: 1206室 / 5栋1单元201 / 请放前台"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 text-xs font-medium"
                />
              </div>

              {/* Default address toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">设为默认收货地址</span>
                  <span className="text-[10px] text-gray-400">下单时将优先选中该地址</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsDefault(!formIsDefault)}
                  className={`w-10 h-6 rounded-full transition p-0.5 cursor-pointer ${
                    formIsDefault ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition transform ${
                      formIsDefault ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-2 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1"
                id="btn-save-address"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>保存地址</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
