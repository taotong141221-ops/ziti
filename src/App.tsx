import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Smartphone,
  Monitor,
  Store,
  ShoppingBag,
  ShoppingCart,
  Gift,
  User,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  Product,
  MerchantConfig,
  Order,
  CartItem,
  FulfillType,
  UserPointRecord,
  DeliveryAddressItem,
} from './types';
import {
  INITIAL_MERCHANTS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_POINTS,
  INITIAL_CART_ITEMS,
  INITIAL_ADDRESSES,
} from './mock/data';
import { MiniProgramFrame } from './components/common/MiniProgramFrame';
import { HomeView } from './components/consumer/HomeView';
import { StoreView } from './components/consumer/StoreView';
import { ProductModal } from './components/consumer/ProductModal';
import { CartView } from './components/consumer/CartView';
import { CheckoutView } from './components/consumer/CheckoutView';
import { PickupDetailView } from './components/consumer/PickupDetailView';
import { DeliveryDetailView } from './components/consumer/DeliveryDetailView';
import { OrderListView, OrderFilterTab } from './components/consumer/OrderListView';
import { AddressListView } from './components/consumer/AddressListView';
import { BenefitsView } from './components/consumer/BenefitsView';
import { ProfileView } from './components/consumer/ProfileView';
import { AfterSalesModal } from './components/consumer/AfterSalesModal';
import { MerchantWorkbench } from './components/merchant/MerchantWorkbench';
import { PlatformDashboard } from './components/platform/PlatformDashboard';
import { speakText, playChime } from './utils/audio';

// Platform Classification:
// 小程序端: 消费者, 商家
// PC端: 后台管理
export type AppPlatform = 'miniprogram' | 'pc_admin';
export type MiniProgramRole = 'consumer' | 'merchant';

type ConsumerTab = 'home' | 'benefits' | 'cart' | 'profile';
type ConsumerView =
  | 'tab_root'
  | 'store_detail'
  | 'checkout'
  | 'pickup_detail'
  | 'delivery_detail'
  | 'order_list'
  | 'address_list';

export default function App() {
  // Main Device / Platform Mode: 小程序端 vs PC端
  const [platform, setPlatform] = useState<AppPlatform>('miniprogram');
  
  // Sub-role within 小程序端: 消费者 vs 商家
  const [miniRole, setMiniRole] = useState<MiniProgramRole>('consumer');

  // Global Shared States
  const [merchants, setMerchants] = useState<MerchantConfig[]>(INITIAL_MERCHANTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [points, setPoints] = useState<UserPointRecord[]>(INITIAL_POINTS);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddressItem[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr_1');

  // Consumer Sub-navigation
  const [consumerTab, setConsumerTab] = useState<ConsumerTab>('home');
  const [consumerView, setConsumerView] = useState<ConsumerView>('tab_root');
  const [orderFilterTab, setOrderFilterTab] = useState<OrderFilterTab>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantConfig>(
    INITIAL_MERCHANTS.find((m) => m.merchantId === 'M20003') || INITIAL_MERCHANTS[0]
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(INITIAL_ORDERS[0]);
  const [aftersaleTargetOrder, setAftersaleTargetOrder] = useState<Order | null>(null);
  const [fulfillType, setFulfillType] = useState<FulfillType>('pickup');
  const [fulfillModeFilter, setFulfillModeFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [currentLocation, setCurrentLocation] = useState<string>('绿茵路·绿地中央广场 (自提0.3km)');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Address Operations ---
  const handleAddAddress = (newAddr: Omit<DeliveryAddressItem, 'id'>) => {
    const newId = `addr_${Date.now()}`;
    const item: DeliveryAddressItem = {
      ...newAddr,
      id: newId,
    };
    if (item.isDefault) {
      setAddresses((prev) => [item, ...prev.map((a) => ({ ...a, isDefault: false }))]);
    } else {
      setAddresses((prev) => [...prev, item]);
    }
    setSelectedAddressId(newId);
    showToast('收货地址添加成功！');
  };

  const handleUpdateAddress = (updated: DeliveryAddressItem) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === updated.id) {
          return updated;
        }
        if (updated.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    showToast('收货地址已修改保存！');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      if (remaining.length > 0) {
        setSelectedAddressId(remaining[0].id);
      }
    }
    showToast('收货地址已删除！');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    setSelectedAddressId(id);
    showToast('已设为默认收货地址！');
  };

  // --- Cart Operations ---
  const handleAddToCart = (product: Product, skuId: string, quantity = 1) => {
    const sku = product.skus.find((s) => s.skuId === skuId) || product.skus[0];
    const existingIndex = cart.findIndex((c) => c.skuId === skuId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        merchantId: product.merchantId,
        productId: product.productId,
        skuId: sku.skuId,
        title: product.title,
        image: product.mainImages[0],
        specDesc: sku.specDesc,
        price: sku.price,
        quantity,
        supportDelivery: product.supportDelivery,
      };
      setCart([...cart, newItem]);
    }
    showToast(`已加入购物车: ${product.title}`);
  };

  const handleUpdateCartQuantity = (skuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.skuId === skuId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (skuId: string) => {
    setCart((prev) => prev.filter((item) => item.skuId !== skuId));
    showToast('已从购物车中移除该商品');
  };

  const handleClearMerchantCart = (merchantId: string) => {
    setCart((prev) => prev.filter((item) => item.merchantId !== merchantId));
    showToast('已清空该商户的购物车商品');
  };

  const handleClearCart = (merchantId?: string) => {
    if (merchantId) {
      handleClearMerchantCart(merchantId);
    } else {
      setCart([]);
      showToast('购物车已清空');
    }
  };

  const handleClearAllCart = () => {
    setCart([]);
    showToast('购物车已全部清空');
  };

  const handleCartCheckout = (merchant: MerchantConfig, itemsToCheckout: CartItem[]) => {
    setSelectedMerchant(merchant);
    setCheckoutItems(itemsToCheckout);
    setConsumerView('checkout');
  };

  const handleBuyNow = (product: Product, skuId: string, quantity = 1) => {
    const sku = product.skus.find((s) => s.skuId === skuId) || product.skus[0];
    const buyItem: CartItem = {
      merchantId: product.merchantId,
      productId: product.productId,
      skuId: sku.skuId,
      title: product.title,
      image: product.mainImages[0],
      specDesc: sku.specDesc,
      price: sku.price,
      quantity,
      supportDelivery: product.supportDelivery,
    };
    const foundMerchant = merchants.find((m) => m.merchantId === product.merchantId) || selectedMerchant;
    setSelectedMerchant(foundMerchant);
    setCheckoutItems([buyItem]);
    setSelectedProduct(null);
    setConsumerView('checkout');
  };

  // --- Order Placement (Consumer Checkout) ---
  const handlePlaceOrder = (newOrderData: Order | Order[]) => {
    const ordersArray = Array.isArray(newOrderData) ? newOrderData : [newOrderData];
    setOrders((prev) => [...ordersArray, ...prev]);
    setActiveOrder(ordersArray[0]);

    // 精确从购物车中扣除本次下单成功的商品
    const orderedSkuIds = new Set(ordersArray.flatMap((o) => o.items.map((i) => i.skuId)));
    setCart((prev) => prev.filter((c) => !orderedSkuIds.has(c.skuId)));
    setCheckoutItems([]);

    // Deduct points if used
    const totalPointDeduct = ordersArray.reduce((s, o) => s + (o.pointDeductAmount || 0), 0);
    if (totalPointDeduct > 0) {
      setPoints((prev) => [
        {
          id: `pt_${Date.now()}`,
          orderNo: ordersArray[0].orderNo,
          amount: totalPointDeduct,
          desc: '社区购下单抵扣积分',
          time: '刚刚',
          balanceAfter: 75.60 - totalPointDeduct,
        },
        ...prev,
      ]);
    }

    // 消费者端提示与跳转
    if (ordersArray.length === 1) {
      showToast(`支付成功！订单已提交至 ${ordersArray[0].merchantName}`);
      setConsumerView('pickup_detail');
    } else {
      showToast(`支付成功！已合并结算生成 ${ordersArray.length} 家商户订单`);
      setConsumerView('order_list');
    }
  };

  // --- Merchant Operations (B-End) ---
  const handleUpdateMerchantConfig = (newConfig: MerchantConfig) => {
    setMerchants((prev) =>
      prev.map((m) => (m.merchantId === newConfig.merchantId ? newConfig : m))
    );
    if (selectedMerchant.merchantId === newConfig.merchantId) {
      setSelectedMerchant(newConfig);
    }
    showToast('商户经营配置已实时更新并生效！');
  };

  const handleAcceptOrder = (orderNo: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderNo === orderNo
          ? {
              ...o,
              orderStatus: 'picking',
            }
          : o
      )
    );
    speakText('接单成功，请在2小时内完成拣货备货！');
    showToast(`订单 ${orderNo} 接单成功，进入拣货备货流程`);
  };

  const handleRejectOrder = (orderNo: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderNo === orderNo
          ? {
              ...o,
              orderStatus: 'refunded',
              afterSale: {
                type: 'full_refund',
                reason,
                status: 'approved',
                refundAmount: o.payAmount,
              },
            }
          : o
      )
    );
    speakText('订单已拒单，资金已原路退回至买家账户。');
    showToast(`订单 ${orderNo} 已拒单并退款`);
  };

  const handleMarkReady = (orderNo: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          return { ...o, orderStatus: 'ready_pickup' };
        }
        return o;
      })
    );
    speakText('备货完成！已通知买家准时到店核销自提！');
    showToast('备货完成，已更新为待自提状态！');
  };

  const handleVerifyPickupCode = (code: string) => {
    const targetOrder = orders.find(
      (o) =>
        o.merchantId === selectedMerchant.merchantId &&
        o.fulfillment.pickupCode === code &&
        (o.orderStatus === 'ready_pickup' || o.orderStatus === 'picking' || o.orderStatus === 'pending_accept')
    );

    if (!targetOrder) {
      return { success: false, message: '无效或已核销的提货码，请核对！' };
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNo === targetOrder.orderNo ? { ...o, orderStatus: 'finished' } : o
      )
    );

    // Reward consumer with points
    const rewardPv = Number((targetOrder.payAmount * 0.05).toFixed(2));
    setPoints((prev) => [
      {
        id: `pt_${Date.now()}`,
        orderNo: targetOrder.orderNo,
        amount: rewardPv,
        desc: '社区购订单自提核销完成获得积分',
        time: '刚刚',
        balanceAfter: (prev[0]?.balanceAfter || 75.60) + rewardPv,
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `核销成功！订单 ${targetOrder.orderNo} 已完成自提履约！`,
      order: targetOrder,
    };
  };

  const handleUpdateProductStock = (productId: string, skuId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.productId === productId) {
          const updatedSkus = p.skus.map((s) =>
            s.skuId === skuId ? { ...s, stock: Math.max(0, newStock) } : s
          );
          return { ...p, skus: updatedSkus };
        }
        return p;
      })
    );
    showToast('库存已同步更新！');
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, saleStatus: p.saleStatus === 'on_sale' ? 'off_sale' : 'on_sale' }
          : p
      )
    );
    showToast('商品上下架状态已切换！');
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.productId === updatedProduct.productId ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  // --- Granular Aftersales Flow Handlers (退款 / 换货 / 退货) ---
  const handleApproveAfterSale = (orderNo: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const type = o.afterSale?.type;
          const isOnlyRefund = type === 'refund' || type === 'full_refund';
          const isPickup = o.fulfillType === 'pickup' || o.fulfillment?.fulfillType === 'pickup';
          // 自提订单退换货无需买家寄回，审核通过直接完成退款/换货
          const isDirectComplete = isOnlyRefund || isPickup;
          const updated: Order = {
            ...o,
            orderStatus: isDirectComplete ? 'refunded' : 'aftersale',
            afterSale: {
              ...o.afterSale!,
              status: isDirectComplete ? 'completed' : 'waiting_customer_ship',
              auditTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
              auditReason: isDirectComplete ? '商家已同意退款并原路退回' : '商家已同意退货申请，请原包装寄回并填写运单号',
              ...(isDirectComplete
                ? { finishTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }) }
                : {}),
            },
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );
    if (updatedOrder) {
      setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? updatedOrder : prev));
    }
  };

  const handleRejectAfterSale = (orderNo: string, reason: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const updated: Order = {
            ...o,
            afterSale: {
              ...o.afterSale!,
              status: 'rejected',
              auditReason: reason,
              auditTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            },
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );
    if (updatedOrder) {
      setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? updatedOrder : prev));
    }
  };

  const handleConfirmCustomerShipped = (orderNo: string, trackingNo?: string, courierName?: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const updated: Order = {
            ...o,
            afterSale: {
              ...o.afterSale!,
              status: 'customer_shipped',
              returnCourier: courierName || '顺丰速运',
              returnTrackingNo: trackingNo || `SF${Date.now().toString().slice(-8)}`,
              returnTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            },
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );
    if (updatedOrder) {
      setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? updatedOrder : prev));
    }
    showToast(`订单 ${orderNo} 退回商品信息已提交，请等待商家验货退款！`);
  };

  const handleConfirmReceivedAndRefund = (orderNo: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const updated: Order = {
            ...o,
            orderStatus: 'refunded',
            afterSale: {
              ...o.afterSale!,
              status: 'completed',
              finishTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            },
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );
    if (updatedOrder) {
      setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? updatedOrder : prev));
    }
  };

  const handleHandleAftersale = (orderNo: string, agree: boolean) => {
    if (agree) {
      handleApproveAfterSale(orderNo);
    } else {
      handleRejectAfterSale(orderNo, '不满足售后退款条件');
    }
  };

  // --- Consumer Confirm & Delivery ---
  const handleConfirmReceived = (orderNo: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNo === orderNo ? { ...o, orderStatus: 'finished' } : o))
    );
    setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? { ...prev, orderStatus: 'finished' } : prev));
    showToast('已确认收货，订单已完成！');
  };

  const handleSubmitAfterSales = (
    orderNo: string,
    reason: string,
    aftersaleType: string = 'only_refund',
    exchangeOptions?: {
      exchangeType?: 'store_exchange';
      exchangeSpec?: string;
      description?: string;
      overdueServiceFee?: number;
      netRefundAmount?: number;
      overdueFeeRate?: number;
      isOverdue?: boolean;
    }
  ) => {
    let updatedTarget: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const isOverdue =
            exchangeOptions?.isOverdue !== undefined ? exchangeOptions.isOverdue : !!o.isOverduePickup;
          const feeRate = exchangeOptions?.overdueFeeRate || o.overdueFeeRate || 10;
          const overdueServiceFee = isOverdue
            ? exchangeOptions?.overdueServiceFee ?? Number(((o.payAmount * feeRate) / 100).toFixed(2))
            : 0;
          const netRefund =
            aftersaleType === 'exchange'
              ? 0
              : exchangeOptions?.netRefundAmount ??
                (isOverdue ? Number(Math.max(0, o.payAmount - overdueServiceFee).toFixed(2)) : o.payAmount);

          const newAfterSale = {
            type: (aftersaleType === 'exchange'
              ? 'exchange'
              : isOverdue
              ? 'partial_refund'
              : 'full_refund') as 'full_refund' | 'partial_refund' | 'exchange',
            exchangeType: exchangeOptions?.exchangeType,
            exchangeSpec: exchangeOptions?.exchangeSpec,
            description: exchangeOptions?.description,
            reason,
            status: 'pending' as const,
            refundAmount: netRefund,
            applyTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            overdueServiceFee: isOverdue ? overdueServiceFee : undefined,
            overdueFeeRate: isOverdue ? feeRate : undefined,
          };

          const updated: Order = {
            ...o,
            orderStatus: 'aftersale',
            aftersaleReason: reason,
            isOverduePickup: isOverdue,
            overdueServiceFee: isOverdue ? overdueServiceFee : 0,
            overdueFeeRate: feeRate,
            afterSale: newAfterSale,
          };
          updatedTarget = updated;
          return updated;
        }
        return o;
      })
    );
    if (updatedTarget) {
      setActiveOrder((prev) => (prev && prev.orderNo === orderNo ? updatedTarget : prev));
    }
    setAftersaleTargetOrder(null);
    showToast(
      aftersaleType === 'exchange'
        ? '换货申请已提交，商户将在48小时内审核调换！'
        : '售后退款申请已提交，请等待商户处理！'
    );
  };

  // 待付款/待备货：买家极速直接退款（免审核，款项原路退回）
  const handleDirectRefund = (orderNo: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          const isPendingPay = o.orderStatus === 'pending_pay';
          const updated: Order = {
            ...o,
            orderStatus: isPendingPay ? 'cancelled' : 'refunded',
            payStatus: 2, // 2: 已退款
            aftersaleReason: isPendingPay ? '买家取消订单未付款' : '买家极速退款（待备货未发货，免审核原路退回）',
            afterSale: {
              type: 'full_refund',
              reason: isPendingPay ? '买家未付款取消' : '待备货订单极速退款（免审核）',
              status: 'completed',
              refundAmount: o.payAmount,
              finishTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            },
          };
          return updated;
        }
        return o;
      })
    );
    setActiveOrder((prev) => {
      if (prev && prev.orderNo === orderNo) {
        const isPendingPay = prev.orderStatus === 'pending_pay';
        return {
          ...prev,
          orderStatus: isPendingPay ? 'cancelled' : 'refunded',
          payStatus: 2,
          aftersaleReason: isPendingPay ? '买家取消订单未付款' : '买家极速退款（待备货未发货，免审核原路退回）',
          afterSale: {
            type: 'full_refund',
            reason: isPendingPay ? '买家未付款取消' : '待备货订单极速退款（免审核）',
            status: 'completed',
            refundAmount: prev.payAmount,
            finishTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          },
        };
      }
      return prev;
    });
    showToast(`订单 ${orderNo} 已完成操作！`);
  };

  const handleCancelAfterSale = (orderNo: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          return {
            ...o,
            orderStatus: 'finished',
            aftersaleReason: undefined,
            afterSale: o.afterSale
              ? {
                  ...o.afterSale,
                  status: 'cancelled',
                }
              : undefined,
          };
        }
        return o;
      })
    );
    setActiveOrder((prev) => {
      if (prev && prev.orderNo === orderNo) {
        return {
          ...prev,
          orderStatus: 'finished',
          aftersaleReason: undefined,
          afterSale: prev.afterSale
            ? {
                ...prev.afterSale,
                status: 'cancelled',
              }
            : undefined,
        };
      }
      return prev;
    });
    showToast(`订单 ${orderNo} 售后申请已成功撤销/取消！`);
  };

  // --- Scenario Simulation ---
  const simulateNewOrderScenario = () => {
    const testOrderNo = `CG${Date.now().toString().slice(-8)}`;
    const testOrder: Order = {
      orderNo: testOrderNo,
      merchantId: selectedMerchant.merchantId,
      merchantName: selectedMerchant.name,
      userId: 'user_sim_88',
      payStatus: 1,
      orderStatus: 'pending_accept',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      goodsAmount: 48.0,
      deliveryFee: 0,
      pointDeductAmount: 0,
      payAmount: 48.0,
      fulfillType: 'pickup',
      selectedPickupTime: '今日 18:30 - 19:30',
      isOverduePickup: false,
      overdueFeeRate: selectedMerchant.pickupOverdueFeeRate || 10,
      items: [
        {
          productId: products[0].productId,
          skuId: products[0].skus[0].skuId,
          titleSnapshot: products[0].title,
          imageSnapshot: products[0].mainImages[0],
          specSnapshot: products[0].skus[0].specDesc,
          priceSnapshot: products[0].skus[0].price,
          quantity: 2,
          itemAmount: 48.0,
        },
      ],
      fulfillment: {
        pickupCode: Math.floor(100000 + Math.random() * 900000).toString(),
        pickupAddress: selectedMerchant.pickupAddress,
        receiverName: '测试买家 (张先生)',
        receiverPhone: '138****5621',
      },
    };

    setOrders([testOrder, ...orders]);
    playChime();
    speakText(`叮咚！${selectedMerchant.name}，您有新的社区自提订单，请及时备货！`);
    showToast(`新自提订单已生成: ${testOrderNo} (预约: 今日 18:30 - 19:30)`);
  };

  const resetAllData = () => {
    setOrders(INITIAL_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    setMerchants(INITIAL_MERCHANTS);
    setPoints(INITIAL_POINTS);
    setCart([]);
    setSelectedMerchant(INITIAL_MERCHANTS[0]);
    setActiveOrder(INITIAL_ORDERS[0]);
    showToast('已重置所有演示数据为初始状态！');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header: Platform & Architecture Controller */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 z-50 sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-black text-sm tracking-tight">
                  本地生活 · 社区购系统
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30 font-bold">
                  高保真原型
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                小程序端 (消费者 / 商家) · PC端 (后台管理)
              </p>
            </div>
          </div>

          {/* Primary Architecture Switcher (小程序端 vs PC端) */}
          <div className="bg-slate-800 p-1 rounded-2xl flex items-center space-x-1.5 border border-slate-700">
            {/* Mode 1: 小程序端 */}
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl">
              <button
                onClick={() => {
                  setPlatform('miniprogram');
                  setMiniRole('consumer');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                  platform === 'miniprogram' && miniRole === 'consumer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-nav-miniprogram-consumer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>小程序 · 消费者端</span>
              </button>

              <button
                onClick={() => {
                  setPlatform('miniprogram');
                  setMiniRole('merchant');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                  platform === 'miniprogram' && miniRole === 'merchant'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-nav-miniprogram-merchant"
              >
                <Store className="w-3.5 h-3.5" />
                <span>小程序 · 商家助手</span>
              </button>
            </div>

            {/* Mode 2: PC端 后台管理 */}
            <button
              onClick={() => setPlatform('pc_admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                platform === 'pc_admin'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              id="btn-nav-pc-admin"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC端 · 后台管理</span>
            </button>
          </div>

          {/* Quick Simulation Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={simulateNewOrderScenario}
              className="px-2.5 py-1.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1"
              title="模拟新买家下单触发播报"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">模拟新买家下单</span>
            </button>

            <button
              onClick={resetAllData}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              title="重置初始演示数据"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-5 overflow-hidden">
        {/* PLATFORM 1: 小程序端 (Fixed iPhone 14 Frame 390×844) */}
        {platform === 'miniprogram' && (
          <div className="flex flex-col items-center">
            <MiniProgramFrame
              title={
                miniRole === 'consumer'
                  ? consumerView === 'tab_root'
                    ? ''
                    : consumerView === 'store_detail'
                    ? selectedMerchant.name
                    : consumerView === 'checkout'
                    ? '确认订单'
                    : consumerView === 'pickup_detail'
                    ? '自提核销凭证'
                    : consumerView === 'delivery_detail'
                    ? '同城配送轨迹'
                    : consumerView === 'address_list'
                    ? '收货地址管理'
                    : '我的订单'
                  : '商家助手工作台'
              }
              showBack={
                miniRole === 'merchant' || (miniRole === 'consumer' && consumerView !== 'tab_root')
              }
              showHome={
                miniRole === 'consumer' && (consumerView !== 'tab_root' || consumerTab !== 'home')
              }
              onBack={() => {
                if (miniRole === 'merchant') {
                  setMiniRole('consumer');
                  setConsumerView('tab_root');
                } else {
                  setConsumerView('tab_root');
                }
              }}
              onGoHome={() => {
                if (miniRole === 'merchant') {
                  setMiniRole('consumer');
                }
                setConsumerTab('home');
                setConsumerView('tab_root');
              }}
              currentRoleName={miniRole === 'consumer' ? '买家 · Ella' : '商户 · 老街坊'}
              onOpenRoleSwitch={() => {
                setMiniRole(miniRole === 'consumer' ? 'merchant' : 'consumer');
                showToast(`已切换身份为: ${miniRole === 'consumer' ? '商家店长' : '买家'}`);
              }}
              navBgClass="bg-white"
            >
              {/* SUB-ROLE A: 消费者端 */}
              {miniRole === 'consumer' && (
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  {consumerView === 'tab_root' && (
                    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
                      {/* Tab Main View Content */}
                      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
                        {consumerTab === 'home' && (
                          <HomeView
                            merchants={merchants}
                            currentLocation={currentLocation}
                            onGoToCart={() => setConsumerTab('cart')}
                            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                            onOpenLocationPicker={() => {
                              setCurrentLocation('红谷滩区绿茵路128号 (老街坊直属圈)');
                              showToast('已切换至当前最近社区商圈');
                            }}
                            onSelectMerchant={(m) => {
                              setSelectedMerchant(m);
                              setConsumerView('store_detail');
                            }}
                          />
                        )}

                        {consumerTab === 'benefits' && (
                          <BenefitsView
                            points={points}
                            merchants={merchants}
                            onSelectMerchant={(m) => {
                              setSelectedMerchant(m);
                              setConsumerView('store_detail');
                            }}
                          />
                        )}

                        {consumerTab === 'cart' && (
                          <CartView
                            merchants={merchants}
                            cartItems={cart}
                            onUpdateQuantity={handleUpdateCartQuantity}
                            onRemoveItem={handleRemoveCartItem}
                            onClearMerchant={handleClearMerchantCart}
                            onClearAll={handleClearAllCart}
                            onGoToStore={(m) => {
                              setSelectedMerchant(m);
                              setConsumerView('store_detail');
                            }}
                            onGoToHome={() => setConsumerTab('home')}
                            onCheckout={handleCartCheckout}
                          />
                        )}

                        {consumerTab === 'profile' && (
                          <ProfileView
                            orders={orders}
                            addresses={addresses}
                            onGoToOrders={(tab) => {
                              setOrderFilterTab(tab || 'all');
                              setConsumerView('order_list');
                            }}
                            onGoToAddresses={() => {
                              setConsumerView('address_list');
                            }}
                            onSwitchToMerchantRole={() => {
                              setMiniRole('merchant');
                              showToast('已进入商家助手工作台！');
                            }}
                            onOpenRoleSwitchModal={() => {
                              setMiniRole(miniRole === 'consumer' ? 'merchant' : 'consumer');
                              showToast(`已切换身份为: ${miniRole === 'consumer' ? '商家店长' : '买家'}`);
                            }}
                          />
                        )}
                      </div>

                      {/* Mini-Program Bottom Tab Bar */}
                      <div className="shrink-0 h-[52px] bg-white border-t border-gray-100 py-1.5 px-3 flex justify-around items-center z-30 shadow-md">
                        <button
                          onClick={() => setConsumerTab('home')}
                          className={`flex flex-col items-center space-y-0.5 cursor-pointer ${
                            consumerTab === 'home' ? 'text-[#00B578] font-black' : 'text-gray-400 font-medium'
                          }`}
                          id="tab-btn-home"
                        >
                          <Store className="w-5 h-5" />
                          <span className="text-[10px]">首页商圈</span>
                        </button>

                        <button
                          onClick={() => setConsumerTab('benefits')}
                          className={`flex flex-col items-center space-y-0.5 cursor-pointer ${
                            consumerTab === 'benefits' ? 'text-[#00B578] font-black' : 'text-gray-400 font-medium'
                          }`}
                          id="tab-btn-benefits"
                        >
                          <Gift className="w-5 h-5" />
                          <span className="text-[10px]">福利账户</span>
                        </button>

                        <button
                          onClick={() => setConsumerTab('cart')}
                          className={`flex flex-col items-center space-y-0.5 cursor-pointer relative ${
                            consumerTab === 'cart' ? 'text-[#00B578] font-black' : 'text-gray-400 font-medium'
                          }`}
                          id="tab-btn-cart"
                        >
                          <div className="relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white shadow-2xs">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px]">购物车</span>
                        </button>

                        <button
                          onClick={() => setConsumerTab('profile')}
                          className={`flex flex-col items-center space-y-0.5 cursor-pointer ${
                            consumerTab === 'profile' ? 'text-[#00B578] font-black' : 'text-gray-400 font-medium'
                          }`}
                          id="tab-btn-profile"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-[10px]">个人中心</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Store Detail Page */}
                  {consumerView === 'store_detail' && (
                    <StoreView
                      merchant={selectedMerchant}
                      products={products}
                      cartItems={cart}
                      fulfillType={fulfillType}
                      onFulfillTypeChange={setFulfillType}
                      onAddToCart={handleAddToCart}
                      onUpdateCartQuantity={handleUpdateCartQuantity}
                      onClearCart={handleClearCart}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onGoToCheckout={() => {
                        const storeItems = cart.filter((c) => c.merchantId === selectedMerchant.merchantId);
                        setCheckoutItems(storeItems);
                        setConsumerView('checkout');
                      }}
                    />
                  )}

                  {/* Checkout Page */}
                  {consumerView === 'checkout' && (
                    <CheckoutView
                      merchant={selectedMerchant}
                      merchants={merchants}
                      cartItems={checkoutItems.length > 0 ? checkoutItems : cart}
                      fulfillType={fulfillType}
                      onFulfillTypeChange={setFulfillType}
                      onPlaceOrder={handlePlaceOrder}
                      onCancel={() => setConsumerView('tab_root')}
                      addresses={addresses}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={setSelectedAddressId}
                      onAddAddress={handleAddAddress}
                    />
                  )}

                  {/* Pickup Code Page */}
                  {consumerView === 'pickup_detail' && activeOrder && (
                    <PickupDetailView
                      order={activeOrder}
                      onPayOrder={(o) => {
                        showToast(`已为订单 ${o.orderNo} 完成模拟付款`);
                        setOrders((prev) =>
                          prev.map((ord) =>
                            ord.orderNo === o.orderNo
                              ? { ...ord, orderStatus: 'pending_accept', payStatus: 1 }
                              : ord
                          )
                        );
                        setActiveOrder((prev) =>
                          prev && prev.orderNo === o.orderNo
                            ? { ...prev, orderStatus: 'pending_accept', payStatus: 1 }
                            : prev
                        );
                      }}
                      onDirectRefund={handleDirectRefund}
                      onApplyAfterSale={(o) => setAftersaleTargetOrder(o)}
                      onCancelAfterSale={handleCancelAfterSale}
                      onConfirmCustomerShipped={handleConfirmCustomerShipped}
                      onGoHome={() => {
                        setConsumerTab('home');
                        setConsumerView('tab_root');
                      }}
                    />
                  )}

                  {/* Delivery Tracking Page */}
                  {consumerView === 'delivery_detail' && activeOrder && (
                    <DeliveryDetailView
                      order={activeOrder}
                      onPayOrder={(o) => {
                        showToast(`已为订单 ${o.orderNo} 完成模拟付款`);
                        setOrders((prev) =>
                          prev.map((ord) =>
                            ord.orderNo === o.orderNo
                              ? { ...ord, orderStatus: 'pending_accept', payStatus: 1 }
                              : ord
                          )
                        );
                        setActiveOrder((prev) =>
                          prev && prev.orderNo === o.orderNo
                            ? { ...prev, orderStatus: 'pending_accept', payStatus: 1 }
                            : prev
                        );
                      }}
                      onDirectRefund={handleDirectRefund}
                      onConfirmReceived={handleConfirmReceived}
                      onApplyAfterSale={(o) => setAftersaleTargetOrder(o)}
                      onCancelAfterSale={handleCancelAfterSale}
                      onConfirmCustomerShipped={handleConfirmCustomerShipped}
                      onGoHome={() => {
                        setConsumerTab('home');
                        setConsumerView('tab_root');
                      }}
                    />
                  )}

                  {/* Order List Page */}
                  {consumerView === 'order_list' && (
                    <OrderListView
                      orders={orders}
                      initialTab={orderFilterTab}
                      onSelectOrder={(o) => {
                        setActiveOrder(o);
                        if (o.fulfillType === 'pickup') {
                          setConsumerView('pickup_detail');
                        } else {
                          setConsumerView('delivery_detail');
                        }
                      }}
                      onGoShopping={() => {
                        setConsumerTab('home');
                        setConsumerView('tab_root');
                      }}
                      onPayOrder={(o) => {
                        setActiveOrder(o);
                        if (o.fulfillType === 'pickup') {
                          setConsumerView('pickup_detail');
                        } else {
                          setConsumerView('delivery_detail');
                        }
                        showToast(`已为订单 ${o.orderNo} 完成模拟付款`);
                        setOrders((prev) =>
                          prev.map((ord) =>
                            ord.orderNo === o.orderNo
                              ? { ...ord, orderStatus: 'pending_accept', payStatus: 1 }
                              : ord
                          )
                        );
                      }}
                      onDirectRefund={handleDirectRefund}
                      onConfirmReceived={handleConfirmReceived}
                      onApplyAfterSale={(o) => setAftersaleTargetOrder(o)}
                      onCancelAfterSale={handleCancelAfterSale}
                      onConfirmCustomerShipped={handleConfirmCustomerShipped}
                    />
                  )}

                  {/* Address List Page */}
                  {consumerView === 'address_list' && (
                    <AddressListView
                      addresses={addresses}
                      onBack={() => setConsumerView('tab_root')}
                      onSelectAddress={(addr) => {
                        setSelectedAddressId(addr.id);
                        showToast(`已选中收货地址: ${addr.name}`);
                      }}
                      onAddAddress={handleAddAddress}
                      onUpdateAddress={handleUpdateAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onSetDefaultAddress={handleSetDefaultAddress}
                    />
                  )}

                  {/* Product Modal Drawer */}
                  {selectedProduct && (
                    <ProductModal
                      product={selectedProduct}
                      onClose={() => setSelectedProduct(null)}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  )}

                  {/* Aftersales Refund Modal */}
                  {aftersaleTargetOrder && (
                    <AfterSalesModal
                      order={aftersaleTargetOrder}
                      onClose={() => setAftersaleTargetOrder(null)}
                      onSubmitAfterSales={handleSubmitAfterSales}
                    />
                  )}
                </div>
              )}

              {/* SUB-ROLE B: 商家助手 (B-End Workbench) */}
              {miniRole === 'merchant' && (
                <MerchantWorkbench
                  merchant={selectedMerchant}
                  orders={orders}
                  products={products.filter((p) => p.merchantId === selectedMerchant.merchantId)}
                  onUpdateMerchantConfig={handleUpdateMerchantConfig}
                  onAcceptOrder={handleAcceptOrder}
                  onRejectOrder={handleRejectOrder}
                  onMarkReady={handleMarkReady}
                  onVerifyPickupCode={handleVerifyPickupCode}
                  onUpdateProductStock={handleUpdateProductStock}
                  onToggleProductStatus={handleToggleProductStatus}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onHandleAftersale={handleHandleAftersale}
                  onApproveAfterSale={handleApproveAfterSale}
                  onRejectAfterSale={handleRejectAfterSale}
                  onConfirmCustomerShipped={handleConfirmCustomerShipped}
                  onConfirmReceivedAndRefund={handleConfirmReceivedAndRefund}
                  onSwitchToConsumer={() => {
                    setMiniRole('consumer');
                    setConsumerView('tab_root');
                  }}
                />
              )}
            </MiniProgramFrame>
          </div>
        )}

        {/* PLATFORM 2: PC端 后台管理 (Full-Width Desktop Web Admin) */}
        {platform === 'pc_admin' && (
          <div className="w-full max-w-7xl h-[860px] animate-in fade-in zoom-in-95 duration-200">
            <PlatformDashboard
              orders={orders}
              merchants={merchants}
              products={products}
              onUpdateMerchantConfig={(updated) => {
                setMerchants((prev) =>
                  prev.map((m) => (m.merchantId === updated.merchantId ? updated : m))
                );
                showToast(`商户 ${updated.name} 参数已更新！`);
              }}
              onApproveAfterSale={(orderNo) => {
                handleApproveAfterSale(orderNo);
                showToast(`订单 ${orderNo} 售后审核已通过！`);
              }}
              onRejectAfterSale={(orderNo, reason) => {
                handleRejectAfterSale(orderNo, reason);
                showToast(`订单 ${orderNo} 售后申请已驳回！`);
              }}
              onConfirmReceivedAndRefund={(orderNo) => {
                handleConfirmReceivedAndRefund(orderNo);
                showToast(`订单 ${orderNo} 验货入库完成，退款已原路退回！`);
              }}
              onInterveneRefund={(orderNo) => {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.orderNo === orderNo
                      ? {
                          ...o,
                          orderStatus: 'refunded',
                          afterSale: {
                            type: 'full_refund',
                            reason: '平台管理员介入极速退款',
                            status: 'approved',
                            refundAmount: o.payAmount,
                          },
                        }
                      : o
                  )
                );
                showToast(`平台已强制为订单 ${orderNo} 执行全额退款！`);
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl z-50 flex items-center space-x-2 border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
