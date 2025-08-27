/**
 * 文件: src/lib/api/wallet.ts
 * 描述: 钱包相关API调用
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. 本文件包含所有钱包相关的API接口调用
 * 2. 包括获取钱包信息、TDB转账、转账历史、交易详情等
 * 3. 使用JWT认证，自动处理token
 * 4. 对应后端的wallet应用接口
 * 
 * 关联文件：
 * - src/lib/api/index.ts: 基础请求函数和认证管理
 * - src/app/wallet/page.tsx: 钱包主页面
 * - src/components/wallet/TransferModal.tsx: 转账弹窗组件
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建，实现TDB转账功能
 */

import { request } from './index'

// ========== 类型定义 ==========

// 钱包信息
export interface Wallet {
  id: number
  username: string
  tdb_balance: string
  tdb_frozen: string
  tdb_available: string
  yld_balance: string
  yld_frozen: string
  yld_available: string
  total_tdb_in: string
  total_tdb_out: string
  total_yld_in: string
  total_yld_out: string
  created_at: string
  updated_at: string
}

// 交易记录
export interface Transaction {
  id: number
  transaction_no: string
  from_username?: string
  to_username?: string
  transaction_type: string
  currency_type: 'TDB' | 'YLD'
  amount: string
  fee: string
  actual_amount: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  memo: string
  created_at: string
  completed_at?: string
}

// TDB转账请求
export interface TDBTransferRequest {
  recipient: string  // 接收方用户名或手机号
  amount: string
  payment_password: string
  memo?: string
}

// TDB转账响应
export interface TDBTransferResponse {
  success: boolean
  message?: string
  error?: string
  errors?: Record<string, string[]>
  data?: {
    transaction_no: string
    amount: string
    fee: string
    total_amount: string
    recipient: string
    balance_after: string
    available_after: string
  }
}

// 转账历史查询参数
export interface TransferHistoryParams {
  direction?: 'all' | 'sent' | 'received'
  currency_type?: 'TDB' | 'YLD' | 'all'
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 转账历史响应
export interface TransferHistoryResponse {
  success: boolean
  data: {
    total: number
    page: number
    page_size: number
    results: Transaction[]
  }
}

// 交易详情响应
export interface TransactionDetailResponse {
  success: boolean
  data: {
    transaction: Transaction
    audit_logs: Array<{
      time: string
      level: string
      message: string
      details: any
    }>
  }
}

// ========== API 接口 ==========

export const walletApi = {
  /**
   * 获取我的钱包信息
   */
  getMyWallet: () => 
    request<{
      success: boolean
      data: Wallet
    }>('/wallet/wallets/my_wallet/'),

  /**
   * TDB转账
   * @param data 转账信息
   */
  transferTDB: (data: TDBTransferRequest) =>
    request<TDBTransferResponse>('/wallet/wallets/transfer_tdb/', {
      method: 'POST',
      body: data,
    }),

  /**
   * 获取转账历史
   * @param params 查询参数
   */
  getTransferHistory: (params?: TransferHistoryParams) =>
    request<TransferHistoryResponse>('/wallet/wallets/transfer_history/', {
      method: 'POST',
      body: params || {},
    }),

  /**
   * 获取交易详情
   * @param transactionNo 交易号
   */
  getTransactionDetail: (transactionNo: string) =>
    request<TransactionDetailResponse>('/wallet/wallets/transaction_detail/', {
      params: { transaction_no: transactionNo },
    }),
}

// ========== 辅助函数 ==========

/**
 * 格式化余额显示
 * @param balance 余额字符串
 * @param decimals 小数位数
 */
export function formatBalance(balance: string | number, decimals: number = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  if (isNaN(num)) return '0'
  
  // 如果整数部分超过1000，使用千位分隔符
  if (num >= 1000) {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }
  
  return num.toFixed(decimals)
}

/**
 * 计算手续费
 * @param amount 转账金额
 * @param feeRate 费率（默认0.8%）
 */
export function calculateFee(amount: string | number, feeRate: number = 0.008): {
  fee: string
  total: string
} {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num) || num <= 0) {
    return { fee: '0', total: '0' }
  }
  
  const fee = num * feeRate
  const total = num + fee
  
  return {
    fee: fee.toFixed(4),
    total: total.toFixed(4)
  }
}

/**
 * 验证转账金额
 * @param amount 金额
 * @param available 可用余额
 */
export function validateTransferAmount(
  amount: string | number, 
  available: string | number
): {
  valid: boolean
  error?: string
} {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
  const availableNum = typeof available === 'string' ? parseFloat(available) : available
  
  if (isNaN(amountNum) || amountNum <= 0) {
    return { valid: false, error: '请输入有效的转账金额' }
  }
  
  if (amountNum < 0.0001) {
    return { valid: false, error: '转账金额不能小于0.0001' }
  }
  
  const { total } = calculateFee(amountNum)
  const totalNum = parseFloat(total)
  
  if (totalNum > availableNum) {
    return { 
      valid: false, 
      error: `余额不足，需要 ${total} TDB（含手续费）` 
    }
  }
  
  return { valid: true }
}
