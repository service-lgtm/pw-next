/**
 * 文件: src/components/wallet/TransferModal.tsx
 * 描述: TDB转账弹窗组件
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. 本文件实现TDB转账功能的弹窗界面
 * 2. 包含接收方输入、金额输入、支付密码验证
 * 3. 实时计算并显示手续费（0.8%）
 * 4. 处理转账API调用和错误提示
 * 
 * 关联文件：
 * - src/lib/api/wallet.ts: 钱包API调用
 * - src/app/wallet/page.tsx: 钱包主页面使用此组件
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { walletApi, calculateFee, validateTransferAmount, formatBalance } from '@/lib/api/wallet'
import toast from 'react-hot-toast'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  availableBalance: string
}

export function TransferModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  availableBalance 
}: TransferModalProps) {
  const [step, setStep] = useState(1) // 1: 填写信息, 2: 确认转账
  const [loading, setLoading] = useState(false)
  
  // 表单数据
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentPassword, setPaymentPassword] = useState('')
  const [memo, setMemo] = useState('')
  
  // 计算的费用
  const [fee, setFee] = useState('0')
  const [total, setTotal] = useState('0')
  
  // 重置表单
  const resetForm = () => {
    setStep(1)
    setRecipient('')
    setAmount('')
    setPaymentPassword('')
    setMemo('')
    setFee('0')
    setTotal('0')
  }
  
  // 关闭弹窗时重置
  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetForm, 300) // 等动画结束后重置
    }
  }, [isOpen])
  
  // 实时计算手续费
  useEffect(() => {
    if (amount) {
      const { fee: calculatedFee, total: calculatedTotal } = calculateFee(amount)
      setFee(calculatedFee)
      setTotal(calculatedTotal)
    } else {
      setFee('0')
      setTotal('0')
    }
  }, [amount])
  
  // 下一步
  const handleNext = () => {
    // 验证接收方
    if (!recipient.trim()) {
      toast.error('请输入接收方用户名或手机号')
      return
    }
    
    // 验证金额
    const validation = validateTransferAmount(amount, availableBalance)
    if (!validation.valid) {
      toast.error(validation.error!)
      return
    }
    
    setStep(2)
  }
  
  // 执行转账
  const handleTransfer = async () => {
    // 验证支付密码
    if (!paymentPassword || paymentPassword.length !== 6) {
      toast.error('请输入6位数字支付密码')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await walletApi.transferTDB({
        recipient: recipient.trim(),
        amount: amount,
        payment_password: paymentPassword,
        memo: memo.trim()
      })
      
      if (response.success && response.data) {
        // 显示成功信息
        toast.success(
          <div>
            <p className="font-bold">转账成功！</p>
            <p className="text-sm mt-1">交易号: {response.data.transaction_no}</p>
            <p className="text-sm">转账金额: {response.data.amount} TDB</p>
            <p className="text-sm">手续费: {response.data.fee} TDB</p>
          </div>,
          { duration: 5000 }
        )
        
        onSuccess()
      } else {
        // 处理错误
        const errorMsg = response.error || response.message || '转账失败'
        toast.error(errorMsg)
        
        // 如果是密码错误，清空密码输入
        if (errorMsg.includes('密码')) {
          setPaymentPassword('')
        }
      }
    } catch (error: any) {
      console.error('转账失败:', error)
      
      // 处理具体错误
      if (error.status === 400 && error.details) {
        // 字段验证错误
        if (error.details.recipient) {
          toast.error(error.details.recipient[0])
          setStep(1) // 返回第一步
        } else if (error.details.payment_password) {
          toast.error(error.details.payment_password[0])
          setPaymentPassword('')
        } else if (error.details.amount) {
          toast.error(error.details.amount[0])
          setStep(1)
        } else {
          toast.error(error.message || '转账失败，请检查输入信息')
        }
      } else {
        toast.error('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          
          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="bg-[#0A1628] border-4 border-gray-800 rounded-lg w-full max-w-md"
              style={{ pointerEvents: 'auto' }}
            >
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-gold-500/20 to-yellow-600/20 p-4 border-b-4 border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gold-500">
                    TDB转账
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="p-6">
                {step === 1 ? (
                  // 第一步：填写转账信息
                  <div className="space-y-4">
                    {/* 可用余额显示 */}
                    <div className="bg-gray-800/50 p-3 rounded">
                      <p className="text-xs text-gray-400">可用余额</p>
                      <p className="text-lg font-bold text-gold-500">
                        {formatBalance(availableBalance)} TDB
                      </p>
                    </div>
                    
                    {/* 接收方 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        接收方
                      </label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="输入用户名或手机号"
                        className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 focus:outline-none text-white"
                      />
                    </div>
                    
                    {/* 转账金额 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        转账金额
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="请输入转账金额"
                        step="0.0001"
                        min="0.0001"
                        className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 focus:outline-none text-white"
                      />
                      {amount && (
                        <div className="mt-2 text-xs space-y-1">
                          <p className="text-gray-400">
                            手续费（0.8%）: <span className="text-orange-400">{fee} TDB</span>
                          </p>
                          <p className="text-gray-400">
                            实际扣除: <span className="text-red-400">{total} TDB</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* 备注（选填） */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        备注（选填）
                      </label>
                      <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="转账备注信息"
                        maxLength={200}
                        className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 focus:outline-none text-white"
                      />
                    </div>
                    
                    {/* 按钮 */}
                    <div className="flex gap-3 pt-2">
                      <PixelButton
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                      >
                        取消
                      </PixelButton>
                      <PixelButton
                        variant="primary"
                        onClick={handleNext}
                        className="flex-1"
                      >
                        下一步
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  // 第二步：确认并输入支付密码
                  <div className="space-y-4">
                    {/* 转账信息确认 */}
                    <div className="bg-gray-800/50 p-4 rounded space-y-3">
                      <h3 className="font-bold text-gold-500 mb-2">转账信息确认</h3>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">接收方:</span>
                        <span className="text-white font-bold">{recipient}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">转账金额:</span>
                        <span className="text-green-500 font-bold">{amount} TDB</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">手续费:</span>
                        <span className="text-orange-400">{fee} TDB</span>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-2 flex justify-between">
                        <span className="text-gray-400">实际扣除:</span>
                        <span className="text-red-400 font-bold text-lg">{total} TDB</span>
                      </div>
                      
                      {memo && (
                        <div className="text-sm">
                          <span className="text-gray-400">备注: </span>
                          <span className="text-gray-300">{memo}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 支付密码 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        支付密码
                      </label>
                      <input
                        type="password"
                        value={paymentPassword}
                        onChange={(e) => setPaymentPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="请输入6位数字支付密码"
                        maxLength={6}
                        className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 focus:outline-none text-white text-center text-lg tracking-widest"
                        autoComplete="off"
                      />
                    </div>
                    
                    {/* 安全提示 */}
                    <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded text-xs text-orange-400">
                      <p className="font-bold mb-1">⚠️ 安全提示</p>
                      <p>转账一旦完成无法撤销，请确认接收方信息无误</p>
                    </div>
                    
                    {/* 按钮 */}
                    <div className="flex gap-3">
                      <PixelButton
                        variant="secondary"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex-1"
                      >
                        上一步
                      </PixelButton>
                      <PixelButton
                        variant="primary"
                        onClick={handleTransfer}
                        disabled={loading || !paymentPassword}
                        className="flex-1"
                      >
                        {loading ? '转账中...' : '确认转账'}
                      </PixelButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
