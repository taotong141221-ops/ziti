import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Boxes,
  UploadCloud,
  Camera,
  FolderPlus,
  Truck,
  ShoppingBag,
  ListPlus,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductSKU } from '../../types';

interface MerchantProductsViewProps {
  products: Product[];
  merchantId: string;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleStatus: (productId: string) => void;
  onShowToast: (msg: string) => void;
}

interface SpecDetailItem {
  id: string;
  skuId?: string;
  detail: string;        // 规格明细* (例如: 红色 / 绿色 / 豪华大份)
  stock: number;         // 数量*
  originalPrice: number; // 原价
  price: number;         // 售价*
}

interface SpecGroupItem {
  id: string;
  specName: string;      // 规格名称* (例如: 颜色 / 份量 / 口味)
  details: SpecDetailItem[];
}

const DEFAULT_CATEGORIES = [
  '招牌主食',
  '特色小吃',
  '新鲜果蔬',
  '商超日用',
  '鲜花绿植',
  '饮品甜点',
  '生鲜熟食',
  '粮油调味',
];

export const MerchantProductsView: React.FC<MerchantProductsViewProps> = ({
  products,
  merchantId,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  onShowToast,
}) => {
  // Category tabs / status filter
  const [activeTab, setActiveTab] = useState<'all' | 'on_sale' | 'off_sale' | 'low_stock'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部分类');

  // Categories pool
  const [categoryList, setCategoryList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirm Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // File input refs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const detailImagesInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('招牌主食');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [formMainImage, setFormMainImage] = useState<string>('');
  const [formDetailText, setFormDetailText] = useState<string>('');
  const [formDetailImages, setFormDetailImages] = useState<string[]>([]);
  const [formTags, setFormTags] = useState<string>('现做现提, 招牌热销');

  // Helper to parse specDesc into specName and specDetail
  const parseSkuDesc = (desc?: string): { specName: string; specDetail: string } => {
    if (!desc) return { specName: '规格', specDetail: '标准份' };
    if (desc.includes(':') || desc.includes('：')) {
      const parts = desc.split(/[:：]/);
      return {
        specName: parts[0]?.trim() || '规格',
        specDetail: parts.slice(1).join(':').trim() || '标准份',
      };
    }
    return {
      specName: '规格',
      specDetail: desc.trim(),
    };
  };

  // Grouped Specifications: A Spec Name containing multiple Spec Details
  const [formSpecGroups, setFormSpecGroups] = useState<SpecGroupItem[]>([
    {
      id: 'grp_1',
      specName: '颜色',
      details: [
        {
          id: 'det_1',
          detail: '红色',
          stock: 50,
          originalPrice: 22.0,
          price: 18.0,
        },
        {
          id: 'det_2',
          detail: '绿色',
          stock: 50,
          originalPrice: 22.0,
          price: 18.0,
        },
      ],
    },
  ]);

  // Filter products for this merchant
  const merchantProducts = products.filter(
    (p) => p.merchantId === merchantId || merchantId === 'M20003' || true
  );

  // Extract unique categories for filter bar
  const allAvailableCategories = [
    '全部分类',
    ...Array.from(
      new Set([
        ...categoryList,
        ...merchantProducts.map((p) => p.categoryL2 || p.categoryL1).filter(Boolean),
      ])
    ),
  ];

  const filteredProducts = merchantProducts.filter((p) => {
    // Search filter
    if (searchKeyword.trim()) {
      const matchTitle = p.title.toLowerCase().includes(searchKeyword.toLowerCase());
      if (!matchTitle) return false;
    }

    // Category filter
    if (selectedCategory !== '全部分类') {
      if (p.categoryL2 !== selectedCategory && p.categoryL1 !== selectedCategory) return false;
    }

    // Status filter
    if (activeTab === 'on_sale') return p.saleStatus === 'on_sale';
    if (activeTab === 'off_sale') return p.saleStatus === 'off_sale';
    if (activeTab === 'low_stock') {
      const totalStock = p.skus?.reduce((sum, s) => sum + s.stock, 0) || 0;
      return totalStock <= 10;
    }

    return true;
  });

  // Handle Main Image Upload via File
  const handleMainImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormMainImage(reader.result);
        onShowToast('商品主图上传成功');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Detail Images Upload via File
  const handleDetailImagesFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormDetailImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    onShowToast(`已添加 ${files.length} 张详情图片`);
  };

  // Remove one detail image
  const handleRemoveDetailImage = (idx: number) => {
    setFormDetailImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory(categoryList[0] || '招牌主食');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormMainImage(
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
    );
    setFormDetailText('精选优质新鲜食材，严格卫生标准，新鲜现做现售。');
    setFormDetailImages([
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    ]);
    setFormTags('现做现提, 招牌热销');
    setFormSpecGroups([
      {
        id: `grp_${Date.now()}_1`,
        specName: '颜色',
        details: [
          {
            id: `det_${Date.now()}_1`,
            detail: '红色',
            stock: 50,
            originalPrice: 22.0,
            price: 18.0,
          },
          {
            id: `det_${Date.now()}_2`,
            detail: '绿色',
            stock: 50,
            originalPrice: 22.0,
            price: 18.0,
          },
        ],
      },
    ]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    const cat = p.categoryL2 || p.categoryL1 || '招牌主食';
    if (categoryList.includes(cat)) {
      setFormCategory(cat);
      setIsCustomCategory(false);
    } else {
      setFormCategory(cat);
      setIsCustomCategory(true);
      setCustomCategoryInput(cat);
    }
    setFormMainImage(
      p.mainImages && p.mainImages[0]
        ? p.mainImages[0]
        : 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
    );
    setFormDetailText(p.detailText || '');
    setFormDetailImages(
      p.detailImages || (p.mainImages && p.mainImages.length > 1 ? p.mainImages.slice(1) : [])
    );
    setFormTags((p.tags || []).join(', '));

    if (p.skus && p.skus.length > 0) {
      const groupsMap = new Map<string, SpecDetailItem[]>();
      p.skus.forEach((s, idx) => {
        const parsed = parseSkuDesc(s.specDesc);
        const grpName = parsed.specName || '规格';
        if (!groupsMap.has(grpName)) {
          groupsMap.set(grpName, []);
        }
        groupsMap.get(grpName)!.push({
          id: `det_${Date.now()}_${idx}`,
          skuId: s.skuId,
          detail: parsed.specDetail || '标准份',
          stock: s.stock ?? 50,
          originalPrice: s.originalPrice ?? s.price,
          price: s.price ?? 18.0,
        });
      });

      const parsedGroups: SpecGroupItem[] = [];
      groupsMap.forEach((details, specName) => {
        parsedGroups.push({
          id: `grp_${Date.now()}_${parsedGroups.length}`,
          specName,
          details,
        });
      });
      setFormSpecGroups(parsedGroups);
    } else {
      setFormSpecGroups([
        {
          id: `grp_${Date.now()}`,
          specName: '颜色',
          details: [
            {
              id: `det_${Date.now()}_1`,
              detail: '红色',
              stock: 50,
              originalPrice: 22.0,
              price: 18.0,
            },
          ],
        },
      ]);
    }
    setIsModalOpen(true);
  };

  // Spec Group Handlers
  const handleAddSpecGroup = () => {
    setFormSpecGroups((prev) => [
      ...prev,
      {
        id: `grp_${Date.now()}`,
        specName: `规格组 ${prev.length + 1}`,
        details: [
          {
            id: `det_${Date.now()}_1`,
            detail: '明细 1',
            stock: 50,
            originalPrice: 25.0,
            price: 20.0,
          },
        ],
      },
    ]);
  };

  const handleRemoveSpecGroup = (groupIndex: number) => {
    if (formSpecGroups.length <= 1) {
      onShowToast('至少保留一组商品规格');
      return;
    }
    setFormSpecGroups((prev) => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    setFormSpecGroups((prev) =>
      prev.map((g, idx) => (idx === groupIndex ? { ...g, specName: name } : g))
    );
  };

  const handleAddDetailToGroup = (groupIndex: number) => {
    setFormSpecGroups((prev) =>
      prev.map((g, idx) => {
        if (idx !== groupIndex) return g;
        return {
          ...g,
          details: [
            ...g.details,
            {
              id: `det_${Date.now()}_${g.details.length + 1}`,
              detail: `明细 ${g.details.length + 1}`,
              stock: 50,
              originalPrice: 25.0,
              price: 20.0,
            },
          ],
        };
      })
    );
  };

  const handleUpdateGroupDetail = (
    groupIndex: number,
    detailIndex: number,
    field: keyof SpecDetailItem,
    value: any
  ) => {
    setFormSpecGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        const updatedDetails = g.details.map((d, dIdx) =>
          dIdx === detailIndex ? { ...d, [field]: value } : d
        );
        return { ...g, details: updatedDetails };
      })
    );
  };

  const handleRemoveDetailFromGroup = (groupIndex: number, detailIndex: number) => {
    setFormSpecGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        if (g.details.length <= 1) {
          onShowToast(`规格「${g.specName}」下至少保留一个明细`);
          return g;
        }
        return {
          ...g,
          details: g.details.filter((_, dIdx) => dIdx !== detailIndex),
        };
      })
    );
  };

  // Add category to pool
  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categoryList.includes(trimmed)) {
      setCategoryList((prev) => [...prev, trimmed]);
      setFormCategory(trimmed);
      onShowToast(`已添加新分类: ${trimmed}`);
    }
    setNewCategoryName('');
    setShowAddCategoryInput(false);
  };

  // Submit Product Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: Title
    if (!formTitle.trim()) {
      onShowToast('请填写商品名称 *');
      return;
    }

    // 2. Validation: Image
    if (!formMainImage.trim()) {
      onShowToast('请上传商品主图 *');
      return;
    }

    // 3. Validation: Spec Groups
    if (formSpecGroups.length === 0) {
      onShowToast('请至少添加一组商品规格 *');
      return;
    }

    for (let gIdx = 0; gIdx < formSpecGroups.length; gIdx++) {
      const grp = formSpecGroups[gIdx];
      if (!grp.specName.trim()) {
        onShowToast(`第 ${gIdx + 1} 组规格名称不能为空 *`);
        return;
      }
      if (grp.details.length === 0) {
        onShowToast(`规格「${grp.specName}」下至少需要 1 个规格明细 *`);
        return;
      }
      for (let dIdx = 0; dIdx < grp.details.length; dIdx++) {
        const d = grp.details[dIdx];
        if (!d.detail.trim()) {
          onShowToast(`规格「${grp.specName}」下的第 ${dIdx + 1} 个规格明细名称不能为空 *`);
          return;
        }
        if (d.price <= 0) {
          onShowToast(`「${grp.specName} - ${d.detail}」的售价必须大于 0 *`);
          return;
        }
        if (d.stock < 0) {
          onShowToast(`「${grp.specName} - ${d.detail}」的数量不能为负数 *`);
          return;
        }
      }
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || '特色精选'
      : formCategory;

    const tagList = formTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const formattedSkus: ProductSKU[] = [];
    formSpecGroups.forEach((grp) => {
      grp.details.forEach((d) => {
        const formattedDesc =
          grp.specName.trim() === '规格' || !grp.specName.trim()
            ? d.detail.trim()
            : `${grp.specName.trim()}: ${d.detail.trim()}`;

        formattedSkus.push({
          skuId: d.skuId || `SKU_${Date.now()}_${formattedSkus.length}`,
          specDesc: formattedDesc,
          stock: Number(d.stock) || 0,
          originalPrice: Number(d.originalPrice) || Number(d.price),
          price: Number(d.price) || 0,
          frozenStock: 0,
        });
      });
    });

    if (editingProduct) {
      // Update existing
      const updated: Product = {
        ...editingProduct,
        title: formTitle.trim(),
        subtitle: undefined, // deleted
        categoryL1: '餐饮美食',
        categoryL2: finalCategory,
        mainImages: [formMainImage],
        detailText: formDetailText.trim(),
        detailImages: formDetailImages,
        tags: tagList,
        skus: formattedSkus,
      };

      onUpdateProduct(updated);
      onShowToast(`已成功保存商品: ${formTitle}`);
    } else {
      // Create new
      const newId = `P_${Date.now()}`;
      const newProduct: Product = {
        productId: newId,
        merchantId: merchantId || 'M20003',
        categoryL1: '餐饮美食',
        categoryL2: finalCategory,
        title: formTitle.trim(),
        mainImages: [formMainImage],
        detailText: formDetailText.trim(),
        detailImages: formDetailImages,
        auditStatus: 'approved',
        saleStatus: 'on_sale',
        totalSold: 0,
        tags: tagList.length > 0 ? tagList : ['新品首发', '现做现售'],
        skus: formattedSkus,
      };

      onAddProduct(newProduct);
      onShowToast(`新商品已上架发布: ${formTitle}`);
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    onDeleteProduct(deleteTargetId);
    onShowToast('商品已删除');
    setDeleteTargetId(null);
  };

  return (
    <div className="flex-1 bg-[#F5F7FA] flex flex-col overflow-y-auto no-scrollbar relative select-none">
      {/* Top Header Area */}
      <div className="bg-gradient-to-b from-[#DCF4EC] via-[#E8F8F2] to-[#F5F7FA] px-4 pt-3 pb-2 shrink-0 space-y-3">
        {/* Title and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight flex items-center space-x-1.5">
              <Package className="w-5 h-5 text-[#00B578]" />
              <span>商品管理</span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              共 {merchantProducts.length} 款商品 ·{' '}
              {merchantProducts.filter((p) => p.saleStatus === 'on_sale').length} 款在售
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-[#00B578] hover:bg-[#009e68] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1 transition cursor-pointer"
            id="btn-add-product"
          >
            <Plus className="w-4 h-4" />
            <span>发布新商品</span>
          </button>
        </div>

        {/* Search Bar & Category filter */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5 border border-gray-200/80 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索商品名称..."
              className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full font-medium"
              id="input-product-search"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white text-xs font-bold text-gray-700 px-2.5 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs outline-none cursor-pointer"
            id="select-product-category"
          >
            {allAvailableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tab Switcher */}
        <div className="flex items-center space-x-4 pt-1 px-1 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: '全部' },
            { key: 'on_sale', label: '在售中' },
            { key: 'off_sale', label: '已下架' },
            { key: 'low_stock', label: '库存预警' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-xs tracking-tight cursor-pointer transition relative pb-1 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'font-black text-gray-900'
                  : 'font-bold text-gray-500 hover:text-gray-800'
              }`}
              id={`tab-product-status-${tab.key}`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="productTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00B578] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Container (Cleaned of all 3 screenshot contents!) */}
      <div className="flex-1 px-3.5 pt-2 pb-24 space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400 text-xs mt-2 space-y-2">
            <Package className="w-8 h-8 mx-auto text-gray-300" />
            <p>暂无符合条件的商品</p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="text-[#00B578] font-bold underline cursor-pointer"
            >
              立即发布第一款商品
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const mainSku = product.skus && product.skus.length > 0 ? product.skus[0] : null;
            const totalStock = product.skus?.reduce((sum, s) => sum + s.stock, 0) || 0;
            const isOnSale = product.saleStatus === 'on_sale';

            return (
              <div
                key={product.productId}
                onClick={() => handleOpenEditModal(product)}
                className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-2.5 transition cursor-pointer hover:border-emerald-300 hover:shadow-xs active:bg-gray-50/70"
                id={`product-card-${product.productId}`}
              >
                {/* Main Product Info (Subtitle Removed!) */}
                <div className="flex items-start space-x-3">
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <img
                      src={
                        product.mainImages?.[0] ||
                        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {!isOnSale && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold">
                        已下架
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h2 className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug">
                        {product.title}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                          isOnSale
                            ? 'bg-emerald-50 text-[#00B578] border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isOnSale ? '售卖中' : '未上架'}
                      </span>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-orange-50 text-orange-600 text-[9px] font-medium px-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price, Stock, Sold */}
                    <div className="flex items-baseline justify-between mt-1.5">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-[10px] text-[#00B578] font-bold">¥</span>
                        <span className="text-sm font-black text-[#00B578] font-sans">
                          {mainSku ? mainSku.price.toFixed(2) : '0.00'}
                        </span>
                        {mainSku?.originalPrice && mainSku.originalPrice > mainSku.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ¥{mainSku.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-gray-500 font-medium space-x-2">
                        <span>
                          库存:{' '}
                          <b
                            className={
                              totalStock <= 10 ? 'text-rose-500 font-black' : 'text-gray-800'
                            }
                          >
                            {totalStock}
                          </b>
                        </span>
                        <span>销量: {product.totalSold || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="border-t border-gray-50 pt-2 flex items-center justify-end space-x-2">
                  {/* Toggle On/Off Sale */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(product.productId);
                      onShowToast(isOnSale ? '商品已下架' : '商品已上架开售');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                      isOnSale
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                    id={`btn-toggle-sale-${product.productId}`}
                  >
                    {isOnSale ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>下架</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>上架</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(product);
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    id={`btn-edit-product-${product.productId}`}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>编辑</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(product.productId);
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="删除商品"
                    id={`btn-delete-product-${product.productId}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal (All New Specifications & Upload Flow) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5 text-gray-900 font-black text-sm">
                  <Package className="w-4 h-4 text-[#00B578]" />
                  <span>{editingProduct ? '编辑商品信息' : '发布新商品'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                {/* 1. 商品名称 (Required) */}
                <div>
                  <label className="block text-gray-800 font-bold mb-1">
                    商品名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例如：老街坊秘制红烧牛肉面"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] font-bold text-gray-900"
                    id="input-form-product-title"
                  />
                </div>

                {/* 2. 编辑/选择分类 (Add/Edit Category) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-800 font-bold">
                      商品分类 <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                      className="text-[#00B578] text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>{showAddCategoryInput ? '关闭新增' : '+ 新增自定义分类'}</span>
                    </button>
                  </div>

                  {/* Add new category inline input */}
                  {showAddCategoryInput && (
                    <div className="mb-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="输入新分类名称..."
                        className="flex-1 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold outline-none text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-1.5 bg-[#00B578] hover:bg-[#009e68] text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
                      >
                        添加
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={isCustomCategory ? '__custom__' : formCategory}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                        } else {
                          setIsCustomCategory(false);
                          setFormCategory(e.target.value);
                        }
                      }}
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] font-bold text-gray-800 cursor-pointer"
                      id="select-form-category"
                    >
                      {categoryList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__custom__">✍️ 自定义分类名称...</option>
                    </select>

                    {isCustomCategory && (
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="自定义分类名称"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] font-bold text-gray-900"
                      />
                    )}
                  </div>
                </div>

                {/* 3. 商品图片 (商品主图限1张 *) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-800 font-bold">
                      商品主图 <span className="text-gray-500 font-normal text-xs">(限1张)</span> <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">仅限上传 1 张主图</span>
                  </div>

                  {/* Hidden File Input (single file only) */}
                  <input
                    type="file"
                    ref={mainImageInputRef}
                    accept="image/*"
                    multiple={false}
                    onChange={handleMainImageFileUpload}
                    className="hidden"
                  />

                  {/* Upload Drop Zone / Preview */}
                  <div className="flex items-center space-x-3">
                    {formMainImage ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0 group">
                        <img
                          src={formMainImage}
                          alt="主图预览"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => mainImageInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>更换主图</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => mainImageInputRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#00B578] bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-[#00B578] cursor-pointer transition shrink-0"
                      >
                        <UploadCloud className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">上传主图</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => mainImageInputRef.current?.click()}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                        id="btn-upload-main-image"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formMainImage ? '更换主图 (限1张)' : '上传主图 (限1张)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. 规格与规格明细 (一个规格名称包含多个规格明细) */}
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-gray-800 font-bold">
                        商品规格与明细 <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400">
                        一个规格名称可包含多个规格明细（例如 规格：颜色，明细：红色、绿色）
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecGroup}
                      className="text-[#00B578] font-bold text-xs flex items-center space-x-1 hover:underline cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 transition hover:bg-emerald-100"
                      id="btn-add-spec-group"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ 添加规格组</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {formSpecGroups.map((group, gIdx) => (
                      <div
                        key={group.id || gIdx}
                        className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 space-y-3"
                      >
                        {/* 规格名称输入与组操作 */}
                        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/80">
                          <div className="flex-1 max-w-xs">
                            <label className="block text-[11px] text-gray-700 font-bold mb-1">
                              规格名称 <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={group.specName}
                              onChange={(e) => handleUpdateGroupName(gIdx, e.target.value)}
                              placeholder="例如：颜色 / 份量 / 口味 / 尺寸"
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#00B578] font-bold text-gray-900 text-xs shadow-xs"
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-4">
                            <button
                              type="button"
                              onClick={() => handleAddDetailToGroup(gIdx)}
                              className="px-2.5 py-1.5 bg-[#00B578] hover:bg-[#009e68] text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                              title="在此规格名称下新增明细"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ 添加规格明细</span>
                            </button>

                            {formSpecGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecGroup(gIdx)}
                                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 border border-rose-200/60 cursor-pointer transition"
                                title="删除整组规格"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 该规格名称下的所有规格明细列表 */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-gray-500 block">
                            规格明细列表 ({group.details.length} 项)
                          </span>

                          <div className="space-y-2">
                            {group.details.map((item, dIdx) => (
                              <div
                                key={item.id || dIdx}
                                className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs space-y-2"
                              >
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  {/* 规格明细* */}
                                  <div className="col-span-12 sm:col-span-4">
                                    <label className="block text-[10px] text-gray-600 font-bold mb-0.5">
                                      规格明细 <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={item.detail}
                                      onChange={(e) =>
                                        handleUpdateGroupDetail(
                                          gIdx,
                                          dIdx,
                                          'detail',
                                          e.target.value
                                        )
                                      }
                                      placeholder="例如：红色 / 绿色 / 大份"
                                      className="w-full px-2 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-[#00B578] font-bold text-gray-900 text-xs"
                                    />
                                  </div>

                                  {/* 原价(元) */}
                                  <div className="col-span-4 sm:col-span-2">
                                    <label className="block text-[10px] text-gray-500 font-bold mb-0.5">
                                      原价(元)
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-1.5 top-1.5 text-xs text-gray-400">
                                        ¥
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={item.originalPrice || ''}
                                        onChange={(e) =>
                                          handleUpdateGroupDetail(
                                            gIdx,
                                            dIdx,
                                            'originalPrice',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-4 pr-1 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-[#00B578] text-gray-500 text-xs font-sans"
                                      />
                                    </div>
                                  </div>

                                  {/* 售价* */}
                                  <div className="col-span-4 sm:col-span-3">
                                    <label className="block text-[10px] text-gray-700 font-bold mb-0.5">
                                      售价(元) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-1.5 top-1.5 text-xs font-bold text-[#00B578]">
                                        ¥
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={item.price || ''}
                                        onChange={(e) =>
                                          handleUpdateGroupDetail(
                                            gIdx,
                                            dIdx,
                                            'price',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-4 pr-1 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-[#00B578] font-black text-[#00B578] text-xs font-sans"
                                      />
                                    </div>
                                  </div>

                                  {/* 数量* */}
                                  <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-[10px] text-gray-700 font-bold mb-0.5">
                                      数量 <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      required
                                      value={item.stock ?? ''}
                                      onChange={(e) =>
                                        handleUpdateGroupDetail(
                                          gIdx,
                                          dIdx,
                                          'stock',
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      placeholder="50"
                                      className="w-full px-2 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-[#00B578] font-bold text-gray-800 text-xs font-sans"
                                    />
                                  </div>

                                  {/* 删除此明细 */}
                                  <div className="col-span-1 flex items-end justify-center pb-0.5">
                                    {group.details.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDetailFromGroup(gIdx, dIdx)}
                                        className="text-rose-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 cursor-pointer transition"
                                        title="删除此规格明细"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. 商品图文详情 (文字描述 + 上传图片*) */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-gray-800 font-bold">
                      商品图文详情 <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => detailImagesInputRef.current?.click()}
                      className="text-[#00B578] text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>+ 上传详情图片</span>
                    </button>
                  </div>

                  {/* Hidden Detail Images Input */}
                  <input
                    type="file"
                    ref={detailImagesInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleDetailImagesFileUpload}
                    className="hidden"
                  />

                  {/* Detail Textarea */}
                  <textarea
                    rows={2}
                    value={formDetailText}
                    onChange={(e) => setFormDetailText(e.target.value)}
                    placeholder="请输入商品特点、原材料说明、食用保质建议等详情文字描述..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] text-gray-800 text-xs leading-relaxed"
                  />

                  {/* Uploaded Detail Images Grid */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-gray-400 font-medium">
                      详情图片 ({formDetailImages.length} 张):
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {formDetailImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                        >
                          <img
                            src={imgUrl}
                            alt={`详情图 ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDetailImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="删除此图"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add more button */}
                      <button
                        type="button"
                        onClick={() => detailImagesInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#00B578] bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-[#00B578] cursor-pointer transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">加详情图</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 7. 营销标签 */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    营销标签 <span className="text-gray-400 font-normal">(逗号分隔)</span>
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="例如：现做现提, 招牌热销, 大厨力荐"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00B578] text-gray-800 text-xs"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center space-x-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#00B578] hover:bg-[#009e68] text-white rounded-xl font-black shadow-sm cursor-pointer"
                    id="btn-submit-product-form"
                  >
                    {editingProduct ? '保存修改' : '确认发布上架'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-gray-900">确认删除该商品？</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                删除后该商品将从商城下架并无法恢复，已产生的历史订单不受影响。
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 bg-[#FF4D4F] hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
