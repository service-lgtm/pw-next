// src/components/settings/AddressSection.tsx
// 地址管理组件

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 地址类型
interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
}

// 模拟的地址数据
const mockAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号SOHO现代城A座1801',
    isDefault: true,
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴环路1000号恒生银行大厦',
    isDefault: false,
  },
]

export function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  })

  // 加载地址列表
  useEffect(() => {
    // TODO: 从后端加载地址列表
    // const loadAddresses = async () => {
    //   const response = await api.accounts.getAddresses()
    //   setAddresses(response.data)
    // }
    // loadAddresses()
  }, [])

  // 编辑地址
  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData(address)
    setShowForm(true)
  }

  // 删除地址
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个地址吗？')) return

    try {
      // TODO: 调用API删除地址
      setAddresses(addresses.filter(addr => addr.id !== id))
      toast.success('地址删除成功')
    } catch (error) {
      toast.error('删除失败，请重试')
    }
  }

  // 设为默认
  const handleSetDefault = async (id: string) => {
    try {
      // TODO: 调用API设置默认地址
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })))
      toast.success('默认地址设置成功')
    } catch (error) {
      toast.error('设置失败，请重试')
    }
  }

  // 保存地址
  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.detail) {
      toast.error('请填写完整的地址信息')
      return
    }

    try {
      if (editingAddress) {
        // 更新地址
        // TODO: 调用API更新地址
        setAddresses(addresses.map(addr => 
          addr.id === editingAddress.id 
            ? { ...addr, ...formData }
            : addr
        ))
        toast.success('地址更新成功')
      } else {
        // 新增地址
        // TODO: 调用API新增地址
        const newAddress: Address = {
          id: Date.now().toString(),
          ...formData as Address,
          isDefault: addresses.length === 0,
        }
        setAddresses([...addresses, newAddress])
        toast.success('地址添加成功')
      }

      // 重置表单
      setShowForm(false)
      setEditingAddress(null)
      setFormData({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
      })
    } catch (error) {
      toast.error('保存失败，请重试')
    }
  }

  return (
    <>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">收货地址管理</h2>
          <PixelButton
            size="sm"
            onClick={() => {
              setEditingAddress(null)
              setFormData({
                name: '',
                phone: '',
                province: '',
                city: '',
                district: '',
                detail: '',
              })
              setShowForm(true)
            }}
          >
            添加地址
          </PixelButton>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>暂无收货地址</p>
            <p className="text-sm mt-2">添加地址后方便购买商品</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold">{address.name}</span>
                      <span className="text-sm text-gray-400">{address.phone}</span>
                      {address.isDefault && (
                        <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-500 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      {address.province} {address.city} {address.district}
                    </p>
                    <p className="text-sm text-gray-300">{address.detail}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-xs text-gray-400 hover:text-gold-500"
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-xs text-blue-500 hover:text-blue-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PixelCard>

      {/* 地址表单弹窗 */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A1628] border-4 border-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {editingAddress ? '编辑地址' : '新增地址'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">收货人</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入收货人姓名"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入手机号"
                  maxLength={11}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm text-gray-400">省份</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="省"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">城市</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="市"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">区县</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="区"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">详细地址</label>
                <textarea
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  rows={3}
                  placeholder="请输入详细地址"
                />
              </div>

              {addresses.length === 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="setDefault"
                    checked={true}
                    disabled
                    className="w-4 h-4"
                  />
                  <label htmlFor="setDefault" className="text-sm text-gray-400">
                    设为默认地址
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                取消
              </PixelButton>
              <PixelButton
                className="flex-1"
                onClick={handleSave}
              >
                保存
              </PixelButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
