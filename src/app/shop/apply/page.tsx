// src/app/shop/apply/page.tsx
// 商家申请页面 - 多步骤表单

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type StepType = 1 | 2 | 3 | 4

interface FormData {
  // 步骤1 - 基本信息
  shopName: string
  businessLicense: File | null
  legalPersonId: File | null
  contactPhone: string
  contactEmail: string
  
  // 步骤2 - 店铺绑定
  selectedPropertyId: string
  
  // 步骤3 - 承诺书
  agreementAccepted: boolean
}

interface Property {
  id: string
  name: string
  address: string
  area: number
  status: 'available' | 'occupied'
}

export default function ShopApplyPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    shopName: '',
    businessLicense: null,
    legalPersonId: null,
    contactPhone: '',
    contactEmail: '',
    selectedPropertyId: '',
    agreementAccepted: false,
  })
  
  // 模拟用户的NFT房产
  const [userProperties] = useState<Property[]>([
    {
      id: 'prop_1',
      name: '陆家嘴商业中心 3层301',
      address: '上海市浦东新区陆家嘴',
      area: 300,
      status: 'available'
    },
    {
      id: 'prop_2',
      name: '南京路步行街 5层502',
      address: '上海市黄浦区南京东路',
      area: 200,
      status: 'available'
    }
  ])

  const steps = [
    { number: 1, title: '基本信息', icon: '📝' },
    { number: 2, title: '绑定店铺', icon: '🏪' },
    { number: 3, title: '签署协议', icon: '📜' },
    { number: 4, title: '提交审核', icon: '✅' },
  ]

  // 处理文件上传
  const handleFileUpload = (field: 'businessLicense' | 'legalPersonId', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过5MB')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
    toast.success('文件上传成功')
  }

  // 验证当前步骤
  const validateStep = (step: StepType): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.shopName &&
          formData.businessLicense &&
          formData.legalPersonId &&
          formData.contactPhone &&
          formData.contactEmail
        )
      case 2:
        return !!formData.selectedPropertyId
      case 3:
        return formData.agreementAccepted
      default:
        return true
    }
  }

  // 提交申请
  const handleSubmit = async () => {
    setLoading(true)
    
    // 模拟提交
    setTimeout(() => {
      toast.success('申请提交成功！请等待审核')
      router.push('/shop/dashboard')
      setLoading(false)
    }, 2000)
  }

  // 进度条宽度
  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          商家入驻申请
        </h1>
        <p className="text-gray-400 mt-1">
          完成申请流程，开启您的数字商业之旅
        </p>
      </motion.div>

      {/* 进度指示器 */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                "flex flex-col items-center",
                currentStep >= step.number ? "text-gold-500" : "text-gray-500"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all",
                  currentStep >= step.number
                    ? "bg-gold-500 text-black"
                    : "bg-gray-800"
                )}
              >
                {currentStep > step.number ? '✓' : step.icon}
              </div>
              <span className="text-sm font-bold">{step.title}</span>
            </div>
          ))}
        </div>
        
        {/* 进度条 */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 表单内容 */}
      <PixelCard className="p-6">
        {/* 步骤1: 基本信息 */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold mb-4">填写基本信息</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                店铺名称 *
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="请输入店铺名称"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  营业执照 *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('businessLicense', e.target.files[0])}
                    className="hidden"
                    id="businessLicense"
                  />
                  <label
                    htmlFor="businessLicense"
                    className="block w-full px-4 py-8 bg-gray-800 text-center rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    {formData.businessLicense ? (
                      <div>
                        <span className="text-green-500">✓</span>
                        <p className="text-sm mt-1">{formData.businessLicense.name}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl">📄</span>
                        <p className="text-sm mt-2">点击上传营业执照</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  法人身份证 *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('legalPersonId', e.target.files[0])}
                    className="hidden"
                    id="legalPersonId"
                  />
                  <label
                    htmlFor="legalPersonId"
                    className="block w-full px-4 py-8 bg-gray-800 text-center rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    {formData.legalPersonId ? (
                      <div>
                        <span className="text-green-500">✓</span>
                        <p className="text-sm mt-1">{formData.legalPersonId.name}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl">🆔</span>
                        <p className="text-sm mt-2">点击上传身份证</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  联系电话 *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="请输入联系电话"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  联系邮箱 *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="请输入联系邮箱"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 步骤2: 绑定店铺 */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold mb-4">选择NFT房产</h2>
            
            {userProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-gray-400 mb-4">您还没有可用的NFT房产</p>
                <PixelButton onClick={() => router.push('/market')}>
                  前往购买房产
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-4">
                {userProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPropertyId: property.id }))}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-all",
                      formData.selectedPropertyId === property.id
                        ? "bg-gold-500/20 border-2 border-gold-500"
                        : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{property.name}</h3>
                        <p className="text-sm text-gray-400">{property.address}</p>
                        <p className="text-sm text-gray-400">面积: {property.area}m²</p>
                      </div>
                      <div className="text-4xl">🏪</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-sm text-blue-400">
                💡 提示：店铺将绑定到您选择的NFT房产上，一旦绑定不可更改
              </p>
            </div>
          </motion.div>
        )}

        {/* 步骤3: 签署协议 */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold mb-4">签署开店承诺书</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg h-96 overflow-y-auto">
              <h3 className="font-bold mb-4">平行世界商家服务协议</h3>
              <div className="space-y-4 text-sm text-gray-300">
                <p>
                  欢迎您入驻平行世界商家平台。在您申请成为平行世界商家之前，请仔细阅读以下条款：
                </p>
                
                <h4 className="font-bold">一、商家资质要求</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>必须持有有效的营业执照</li>
                  <li>法人身份信息真实有效</li>
                  <li>提供的商品必须为正品，符合质量标准</li>
                  <li>遵守平台的所有规则和政策</li>
                </ul>
                
                <h4 className="font-bold">二、提货单发行规则</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>发行提货单需预存首月分红</li>
                  <li>必须按时发放月度分红</li>
                  <li>确保提货单对应的商品真实可兑换</li>
                  <li>接受平台的监督和审核</li>
                </ul>
                
                <h4 className="font-bold">三、违规处罚</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>售假将永久封店并公示</li>
                  <li>延迟分红将冻结店铺功能</li>
                  <li>恶意欺诈将承担法律责任</li>
                </ul>
                
                <p className="mt-6">
                  本协议基于区块链智能合约执行，一经签署即不可撤销。
                </p>
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreementAccepted}
                onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
                className="w-5 h-5 text-gold-500"
              />
              <span className="font-bold">
                我已阅读并同意《平行世界商家服务协议》
              </span>
            </label>
          </motion.div>
        )}

        {/* 步骤4: 提交审核 */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold mb-4">确认提交</h2>
            
            <div className="space-y-4">
              <PixelCard className="p-4 bg-gray-800">
                <h3 className="font-bold mb-3">申请信息确认</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">店铺名称</span>
                    <span>{formData.shopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">联系电话</span>
                    <span>{formData.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">联系邮箱</span>
                    <span>{formData.contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">绑定房产</span>
                    <span>
                      {userProperties.find(p => p.id === formData.selectedPropertyId)?.name}
                    </span>
                  </div>
                </div>
              </PixelCard>
              
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-sm text-green-400">
                  ✅ 所有资料已准备完毕，提交后我们将在1-3个工作日内完成审核
                </p>
              </div>
              
              <PixelButton
                className="w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '提交中...' : '提交申请'}
              </PixelButton>
            </div>
          </motion.div>
        )}

        {/* 底部按钮 */}
        <div className="flex justify-between mt-8">
          <PixelButton
            variant="secondary"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as StepType)}
            disabled={currentStep === 1}
          >
            上一步
          </PixelButton>
          
          {currentStep < 4 ? (
            <PixelButton
              onClick={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep(prev => Math.min(4, prev + 1) as StepType)
                } else {
                  toast.error('请完成当前步骤的所有必填项')
                }
              }}
            >
              下一步
            </PixelButton>
          ) : null}
        </div>
      </PixelCard>
    </div>
  )
}
