import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Store,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { Product, MerchantConfig } from '../../types';

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl?: string;
  createTime: string;
  associatedMerchantIds?: string[]; // 关联商家ID列表
  associatedMerchantNames?: string[]; // 关联商家名称列表
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'CAT001',
    name: '生鲜果蔬',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['老街坊果蔬生鲜超市 (绿茵路店)'],
    associatedMerchantIds: ['M20001'],
    createTime: '2026-08-28 10:20:00',
  },
  {
    id: 'CAT002',
    name: '禽肉蛋品',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['老街坊果蔬生鲜超市 (绿茵路店)'],
    associatedMerchantIds: ['M20001'],
    createTime: '2026-08-28 09:15:00',
  },
  {
    id: 'CAT003',
    name: '商超便利',
    imageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['悦家折扣生活超市 (红谷滩旗舰店)'],
    associatedMerchantIds: ['M20002'],
    createTime: '2026-08-27 18:30:00',
  },
  {
    id: 'CAT004',
    name: '特色餐饮',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['老街坊牛肉面馆'],
    associatedMerchantIds: ['M20003'],
    createTime: '2026-08-27 14:00:00',
  },
  {
    id: 'CAT005',
    name: '烘焙饮品',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['悦家折扣生活超市 (红谷滩旗舰店)', '花之语'],
    associatedMerchantIds: ['M20002', 'M20004'],
    createTime: '2026-08-26 11:20:00',
  },
  {
    id: 'CAT006',
    name: '时令礼盒',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
    associatedMerchantNames: ['花之语'],
    associatedMerchantIds: ['M20004'],
    createTime: '2026-08-25 16:45:00',
  },
];

interface CategoryManageViewProps {
  products?: Product[];
  merchants?: MerchantConfig[];
}

export const CategoryManageView: React.FC<CategoryManageViewProps> = ({ merchants = [] }) => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchText, setSearchText] = useState('');

  // 文件上传 Ref & 拖拽状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 弹窗状态 (新增/编辑)
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem>>({
    name: '',
    imageUrl: '',
    associatedMerchantIds: [],
    associatedMerchantNames: [],
  });

  // 关联商家详情查看弹窗状态
  const [merchantListModal, setMerchantListModal] = useState<{
    show: boolean;
    categoryName: string;
    merchants: { id: string; name: string }[];
  }>({
    show: false,
    categoryName: '',
    merchants: [],
  });

  // 处理单张图片上传
  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传有效的图片文件 (如 JPG, PNG, WEBP, GIF 等)！');
      return;
    }
    // 限制单张大小不超过 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setEditingCategory((prev) => ({
          ...prev,
          imageUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // 文件选择更改
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessImageFile(files[0]);
    }
    e.target.value = '';
  };

  // 拖拽放入
  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessImageFile(e.dataTransfer.files[0]);
    }
  };

  // 移除已上传图片
  const handleRemoveImage = () => {
    setEditingCategory((prev) => ({
      ...prev,
      imageUrl: '',
    }));
  };

  // 根据搜索名称或关联商家过滤分类
  const filteredCategories = categories.filter((cat) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return true;

    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.associatedMerchantNames || []).some((m) => m.toLowerCase().includes(q))
    );
  });

  // 删除分类
  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`确认要删除分类【${name}】吗？`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // 打开新增分类弹窗
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingCategory({
      name: '',
      imageUrl: '',
      associatedMerchantIds: [],
      associatedMerchantNames: [],
    });
    setShowEditModal(true);
  };

  // 打开编辑分类弹窗
  const handleOpenEdit = (cat: CategoryItem) => {
    setModalMode('edit');
    setEditingCategory({
      ...cat,
      associatedMerchantIds: cat.associatedMerchantIds || [],
      associatedMerchantNames: cat.associatedMerchantNames || [],
    });
    setShowEditModal(true);
  };

  // 打开关联商家查看弹窗
  const handleOpenMerchantListModal = (cat: CategoryItem) => {
    const names = cat.associatedMerchantNames || [];
    const ids = cat.associatedMerchantIds || [];
    const merchantItems = names.map((name, index) => ({
      id: ids[index] || `M_${index + 1}`,
      name,
    }));

    setMerchantListModal({
      show: true,
      categoryName: cat.name,
      merchants: merchantItems,
    });
  };

  // 切换关联商家选择
  const handleToggleMerchant = (merchantId: string, merchantName: string) => {
    setEditingCategory((prev) => {
      const currentIds = prev.associatedMerchantIds || [];
      const currentNames = prev.associatedMerchantNames || [];
      const exists = currentIds.includes(merchantId);

      if (exists) {
        return {
          ...prev,
          associatedMerchantIds: currentIds.filter((id) => id !== merchantId),
          associatedMerchantNames: currentNames.filter((name) => name !== merchantName),
        };
      } else {
        return {
          ...prev,
          associatedMerchantIds: [...currentIds, merchantId],
          associatedMerchantNames: [...currentNames, merchantName],
        };
      }
    });
  };

  // 保存分类
  const handleSaveCategory = () => {
    if (!editingCategory.name?.trim()) {
      alert('请输入分类名称！');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');

    if (modalMode === 'edit' && editingCategory.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? ({
                ...c,
                name: editingCategory.name!.trim(),
                imageUrl: editingCategory.imageUrl?.trim() || '',
                associatedMerchantIds: editingCategory.associatedMerchantIds || [],
                associatedMerchantNames: editingCategory.associatedMerchantNames || [],
              } as CategoryItem)
            : c
        )
      );
    } else {
      const newId = `CAT_${Date.now().toString().slice(-6)}`;

      const newItem: CategoryItem = {
        id: newId,
        name: editingCategory.name.trim(),
        imageUrl:
          editingCategory.imageUrl?.trim() ||
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
        associatedMerchantIds: editingCategory.associatedMerchantIds || [],
        associatedMerchantNames: editingCategory.associatedMerchantNames || [],
        createTime: now,
      };

      setCategories((prev) => [newItem, ...prev]);
    }

    setShowEditModal(false);
  };

  // 可选的所有商家列表 (合并预设与传入的merchants)
  const allAvailableMerchants = merchants.length > 0 ? merchants : [
    { merchantId: 'M20001', name: '老街坊果蔬生鲜超市 (绿茵路店)' },
    { merchantId: 'M20002', name: '悦家折扣生活超市 (红谷滩旗舰店)' },
    { merchantId: 'M20003', name: '老街坊牛肉面馆' },
    { merchantId: 'M20004', name: '花之语' },
  ];

  return (
    <div className="space-y-4">
      {/* 顶部操作与查询工具栏 (查询条件：搜索名称；操作置顶在最上方) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 查询条件：搜索名称 */}
          <div className="flex items-center space-x-2.5 flex-1 max-w-md">
            <div className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-category-input"
                type="text"
                placeholder="搜索分类名称或关联商家..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 顶部操作：新增分类 */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="btn-create-category"
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增分类</span>
            </button>
          </div>
        </div>
      </div>

      {/* 分类列表 */}
      {/* 字段：序号，分类名称，分类图片，关联商家(数量可点击查看详情)，创建时间，操作 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-16 text-center">序号</th>
                <th className="py-3 px-4 min-w-[200px]">分类名称</th>
                <th className="py-3 px-4 w-24 text-center">分类图片</th>
                <th className="py-3 px-4 min-w-[140px] text-center">关联商家</th>
                <th className="py-3 px-4 min-w-[150px]">创建时间</th>
                {/* 操作列固定在最右侧 */}
                <th className="py-3 px-4 w-32 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    暂无匹配的分类数据
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const merchantCount = cat.associatedMerchantNames?.length || 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group bg-white">
                      {/* 序号 */}
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {idx + 1}
                      </td>

                      {/* 分类名称 */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-[13px]">
                          {cat.name}
                        </span>
                      </td>

                      {/* 分类图片 */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-sm text-slate-400">无图片</span>
                          )}
                        </div>
                      </td>

                      {/* 关联商家 (显示数量，点击弹窗查看具体商家) */}
                      <td className="py-3 px-4 text-center">
                        {merchantCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenMerchantListModal(cat)}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer hover:shadow-xs group/btn"
                            title="点击查看关联的具体商家"
                          >
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-mono text-[13px]">{merchantCount}</span>
                            <span className="text-[11px] text-emerald-600 font-normal">家</span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">0 家</span>
                        )}
                      </td>

                      {/* 创建时间 */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {cat.createTime}
                      </td>

                      {/* 操作 (固定最右侧) */}
                      <td className="py-3 px-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            title="编辑"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            title="删除"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* 关联商家详情弹窗 Modal */}
      {merchantListModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span>关联商家详情</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  当前分类：<span className="font-bold text-slate-800">{merchantListModal.categoryName}</span> (共 {merchantListModal.merchants.length} 家)
                </p>
              </div>
              <button
                onClick={() => setMerchantListModal({ show: false, categoryName: '', merchants: [] })}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 商家列表展示 */}
            <div className="max-h-60 overflow-y-auto space-y-2 py-1 pr-1">
              {merchantListModal.merchants.map((merchant, idx) => (
                <div
                  key={merchant.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{merchant.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">商户ID: {merchant.id}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 shrink-0 ml-2">
                    已关联
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMerchantListModal({ show: false, categoryName: '', merchants: [] })}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增 / 编辑分类弹窗 Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {modalMode === 'edit' ? '编辑商家分类' : '新增商家分类'}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗表单：分类名称、分类图片、关联商家 */}
            <div className="space-y-4 text-xs font-medium text-slate-700">
              {/* 1. 分类名称 * (必填) */}
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">
                  分类名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入分类名称"
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* 2. 分类图片 (仅限上传一张) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-900 font-bold">
                    分类图片
                  </label>
                  <span className="text-[11px] text-slate-400">仅限上传 1 张</span>
                </div>

                {/* 隐藏的真实文件选择控件 */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {editingCategory.imageUrl ? (
                  /* 已上传图片预览与操作 */
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/30">
                    <div className="w-16 h-16 rounded-xl bg-white border border-emerald-200 overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={editingCategory.imageUrl}
                        alt="分类图片预览"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          已上传 1 张图片
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        点击下方按钮可重新上传替换或移除图片
                      </p>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100/60 rounded-lg border border-emerald-200 transition cursor-pointer flex items-center space-x-1"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>重新上传</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>删除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 未上传时：拖拽/点击上传区域 */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropImage}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition cursor-pointer text-center ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mb-0.5">
                      点击或拖拽图片至此处上传
                    </p>
                    <p className="text-[11px] text-slate-400">
                      仅限上传 1 张，支持 JPG、PNG、WEBP、GIF (单张不超过5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* 3. 关联商家 */}
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">
                  关联商家
                </label>
                <div className="border border-slate-200 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-slate-50/50">
                  {allAvailableMerchants.map((m) => {
                    const isChecked = (editingCategory.associatedMerchantIds || []).includes(m.merchantId);
                    return (
                      <label
                        key={m.merchantId}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                          isChecked
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'hover:bg-white text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Store className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="truncate">{m.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMerchant(m.merchantId, m.name)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 弹窗底部按钮 */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
