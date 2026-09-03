export type FulfillType = 'pickup' | 'delivery';

export type OrderStatus =
  | 'pending_pay'      // 待支付 / 待付款
  | 'pending_accept'   // 待接单 (已付，待商家接单/待备货)
  | 'picking'          // 拣货中 / 备货中 (商家已接单，备货中)
  | 'ready_pickup'     // 待自提 (自提核销码已生效)
  | 'finished'         // 已完成 (交易完成+发放积分)
  | 'aftersale'        // 售后中
  | 'cancelled'        // 已取消
  | 'refunded'         // 已退款
  // Compatibility
  | 'ready_delivery'
  | 'delivering'
  | 'delivered';

export interface DeliveryAddressItem {
  id: string;
  name: string;
  phone: string;
  tag: string;
  address: string;
  detail?: string;
  isDefault: boolean;
}

export interface MerchantBankCard {
  id: string;
  bankName: string;
  cardNo: string;
  holderName: string;
  branchName: string;
  cardType: string;
  theme: 'emerald' | 'gold';
}

export interface MerchantConfig {
  merchantId: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  monthlySales: number;
  distanceKm: number;
  auditStatus: 'pending' | 'approved' | 'rejected' | 'closed';
  pickupAddress: string;
  pickupLocation: { lng: number; lat: number };
  pickupTimeSlots?: string;   // 每日自提时段 (例如: 08:30 - 21:30)
  businessHours: string;
  phone: string;
  pickupOverdueFeeRate?: number; // 超过自提时间未提货退款收取服务费比例 (0-100, 默认 10 表示扣除10%服务费)
  pickupPrepTimeMinutes?: number; // 备货耗时分钟数 (0, 15, 30, 45, 60)
  pickupAdvanceDays?: number;     // 允许提前预约天数 (1=仅当天, 2=未来2天, 3=未来3天)
  pickupAutoPrintReceipt?: boolean; // 核销后自动打印小票
  pickupExpiryHours?: number;     // 凭证有效小时数
  pickupExpiryDesc?: string;      // 凭证有效说明
  isOpen?: boolean;
  merchantCode?: string;
  rebateRate?: number;
  balance?: number;
  withdrawableAmount?: number;
  totalRevenue?: number;
  associatedIncome?: number;
  expandedMerchantsCount?: number;
  referralIncome?: number;
  doorImage?: string;
  environmentImages?: string[];
  description?: string;
  bankCards?: MerchantBankCard[];
}

export interface ProductSKU {
  skuId: string;
  specDesc: string;
  price: number;
  originalPrice: number;
  stock: number;
  frozenStock: number;
}

export interface Product {
  productId: string;
  merchantId: string;
  categoryL1: string;
  categoryL2: string;
  title: string;
  subtitle?: string;
  mainImages: string[];
  detailText?: string;
  detailImages?: string[];
  supportPickup?: boolean;
  supportDelivery?: boolean;
  auditStatus?: 'approved' | 'pending' | 'rejected';
  saleStatus?: 'on_sale' | 'off_sale' | 'sold_out';
  status?: number;
  totalSold?: number;
  skus: ProductSKU[];
  tags?: string[];
}

export interface CartItem {
  merchantId: string;
  productId: string;
  skuId: string;
  title: string;
  image: string;
  specDesc: string;
  price: number;
  quantity: number;
  supportDelivery?: boolean;
}

export interface OrderItem {
  skuId: string;
  productId: string;
  titleSnapshot: string;
  name?: string;
  specSnapshot: string;
  spec?: string;
  imageSnapshot: string;
  image?: string;
  priceSnapshot: number;
  price?: number;
  quantity: number;
  count?: number;
  itemAmount?: number;
  subtotal?: number;
  pointAwarded?: number;
}

export interface OrderFulfillment {
  fulfillType?: FulfillType;
  // 自提数据
  pickupCode?: string;        // 6位数字核销码
  qrToken?: string;
  codeStatus?: 'unused' | 'used' | 'expired';
  selectedPickupTime?: string; // 客户下单时选择的自提时间
  verifyTime?: string;        // 提货/核销时间
  pickupTime?: string;        // 提货时间
  pickupAddress?: string;
  pickupLocation?: { lng: number; lat: number };
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
}

export interface AfterSaleInfo {
  type: 'full_refund' | 'partial_refund' | 'refund' | 'exchange' | 'return';
  afterSaleNo?: string;
  exchangeType?: 'store_exchange';
  exchangeOptions?: {
    exchangeType?: 'store_exchange';
    exchangeSpec?: string;
    description?: string;
  };
  reason: string;
  description?: string;
  status:
    | 'pending'
    | 'approved'
    | 'waiting_customer_ship'
    | 'customer_shipped'
    | 'completed'
    | 'rejected'
    | 'exchanging';
  refundAmount?: number;
  netRefundAmount?: number;
  originalPayAmount?: number;
  overdueServiceFee?: number;  // 超时未提扣除服务费
  overdueFeeRate?: number;     // 扣除服务费比例 (如 10%)
  exchangeProductTitle?: string;
  exchangeSpec?: string;
  exchangeQuantity?: number;
  exchangePrice?: number;
  merchantNote?: string;
  applyTime?: string;         // 申请售后时间
  auditTime?: string;         // 审核时间
  auditReason?: string;
  returnTrackingNo?: string;
  returnCourier?: string;
  returnTime?: string;
  finishTime?: string;        // 完成售后时间
  refundTime?: string;        // 退款到账时间
  images?: string[];
}

export interface Order {
  orderNo: string;
  userId: string;
  merchantId: string;
  merchantName: string;
  merchantAddress?: string;
  merchantPhone?: string;
  fulfillType: FulfillType;
  channel?: 'online' | 'offline'; // 线上/线下
  rebateDiscount?: number; // 让利优惠
  merchantDoorImage?: string; // 门店图片
  orderStatus: OrderStatus;
  selectedPickupTime?: string; // 客户预约自提时间 (例如: "今日 18:30 - 19:30")
  isOverduePickup?: boolean;   // 是否已超过客户预约自提时间
  overdueServiceFee?: number;  // 超时未提申请退款时扣除的服务费金额
  overdueFeeRate?: number;     // 扣除的服务费率 (例如 10%)
  items: OrderItem[];
  goodsAmount: number;
  deliveryFee?: number;
  pointDeductAmount: number;
  discountAmount?: number;
  couponDiscountAmount?: number;
  payAmount: number;
  payStatus: 0 | 1 | 2;       // 0未付 1已付 2已退
  createTime: string;
  payTime?: string;           // 付款时间
  acceptTime?: string;
  readyTime?: string;
  pickupTime?: string;        // 提货时间
  finishTime?: string;
  fulfillment: OrderFulfillment;
  remark?: string;
  aftersaleReason?: string;
  afterSale?: AfterSaleInfo;
  address?: {
    receiverName: string;
    phone: string;
    address: string;
  };
  version?: number;
}

export interface UserPointRecord {
  id: string;
  userId?: string;
  orderNo?: string;
  type?: 'earn' | 'deduct';
  changeType?: 'use' | 'consume_reward';
  amount?: number;
  changePv?: number;
  currentPv?: number;
  title?: string;
  desc?: string;
  time?: string;
  createTime?: string;
  balanceAfter?: number;
}
