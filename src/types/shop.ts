// src/types/shop.ts
// 商城相关类型定义

// TDB套餐类型
export interface TDBPackage {
  id: string
  name: string
  amount: number
  price: number
  discount?: number
  popular?: boolean
  bonus?: number
  description?: string
}

// 订单状态
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// 支付方式
export type PaymentMethod = 'alipay' | 'bank' | 'wechat'

// 订单类型
export interface Order {
  id: string
  userId: number
  productType: 'tdb' | 'land' | 'tool'
  productId?: string
  productName: string
  amount: number
  price: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  paymentInfo?: {
    transactionId?: string
    paidAt?: string
  }
  addressId?: string
  address?: Address
  remark?: string
  createTime: string
  updateTime: string
}

// 支付账户信息
export interface PaymentAccount {
  method: PaymentMethod
  account: string
  accountName: string
  qrCode?: string
  bank?: string
  branch?: string
  isActive: boolean
}

// 地址类型
export interface Address {
  id: string
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postcode?: string
  isDefault: boolean
  createTime?: string
  updateTime?: string
}

// 创建订单请求
export interface CreateOrderRequest {
  productType: 'tdb'
  packageId?: string
  amount?: number
  price?: number
  paymentMethod: PaymentMethod
}

// 创建订单响应
export interface CreateOrderResponse {
  success: boolean
  message: string
  data: {
    orderId: string
    paymentAccount: PaymentAccount
    expireTime: string
  }
}

// 确认支付请求
export interface ConfirmPaymentRequest {
  orderId: string
  transactionId?: string
}

// 提交地址请求
export interface SubmitAddressRequest {
  orderId: string
  addressId: string
}

// 地址管理请求
export interface CreateAddressRequest {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postcode?: string
  isDefault?: boolean
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  id: string
}
