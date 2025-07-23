// src/components/settings/AddressSection.tsx
// 地址管理组件

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Address } from '@/lib/api'

export function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    postcode: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 加载地址列表
  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await api.accounts.addresses.list()
      if (response.success && response.data) {
        setAddresses(response.data)
      }
    } catch (error) {
      console.error('加载地址失败:', error)
      toast.error('加载地址失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  // 编辑地址
  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      postcode: address.postcode || '',
    })
    setShowForm(true)
  }

  // 删除地址
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个地址吗？')) return

    try {
      const response = await api.accounts.addresses.delete(id)
      if (response.success) {
        toast.success('地址删除成功')
        await loadAddresses()
      }
    } catch (error: any) {
      if (error.message?.includes('不能删除最后一个')) {
        toast.error('不能删除最后一个收货地址')
      } else {
        toast.error('删除失败，请重试')
      }
    }
  }

  // 设为默认
  const handleSetDefault = async (id: string) => {
    try {
      const response = await api.accounts.addresses.setDefault(id)
      if (response.success) {
        toast.success('默认地址设置成功')
        await loadAddresses()
      }
    } catch (error) {
      toast.error('设置失败，请重试')
    }
  }

  // 验证表单
  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      toast.error('姓名至少需要2个字符')
      return false
    }
    
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.error('请输入正确的手机号')
      return false
    }
    
    if (!formData.province || !formData.city || !formData.district) {
      toast.error('请填写完整的省市区信息')
      return false
    }
    
    if (!formData.detail || formData.detail.length < 5) {
      toast.error('详细地址至少需要5个字符')
      return false
    }
    
    if (formData.postcode && !/^\d{6}$/.test(formData.postcode)) {
      toast.error('邮编必须是6位数字')
      return false
    }
    
    return true
  }

  // 保存地址
  const handleSave = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      if (editingAddress) {
        // 更新地址
        const response = await api.accounts.addresses.update(editingAddress.id, {
          name: formData.name!,
          phone: formData.phone!,
          province: formData.province!,
          city: formData.city!,
          district: formData.district!,
          detail: formData.detail!,
          postcode: formData.postcode,
        })
        
        if (response.success) {
          toast.success('地址更新成功')
          await loadAddresses()
        }
      } else {
        // 新增地址
        const response = await api.accounts.addresses.create({
          name: formData.name!,
          phone: formData.phone!,
          province: formData.province!,
          city: formData.city!,
          district: formData.district!,
          detail: formData.detail!,
          postcode: formData.postcode,
          is_default: addresses.length === 0,
        })
        
        if (response.success) {
          toast.success('地址添加成功')
          await loadAddresses()
        }
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
        postcode: '',
      })
    } catch (error: any) {
      console.error('保存地址失败:', error)
      
      // 处理字段错误
      if (error.details?.errors) {
        const errors = error.details.errors
        if (errors.name) toast.error(errors.name[0])
        else if (errors.phone) toast.error(errors.phone[0])
        else if (errors.detail) toast.error(errors.detail[0])
        else toast.error('保存失败，请检查输入')
      } else {
        toast.error('保存失败，请重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PixelCard className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-gray-400">加载地址中...</p>
        </div>
      </PixelCard>
    )
  }

  return (
    <>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">收货地址管理</h2>
          {addresses.length < 10 && (
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
                  postcode: '',
                })
                setShowForm(true)
              }}
            >
              添加地址
            </PixelButton>
          )}
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
                      {address.is_default && (
                        <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-500 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      {address.full_address || `${address.province}${address.city}${address.district}${address.detail}`}
                    </p>
                    {address.postcode && (
                      <p className="text-xs text-gray-500 mt-1">邮编: {address.postcode}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!address.is_default && (
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
            
            {addresses.length >= 10 && (
              <p className="text-xs text-gray-500 text-center">最多可添加10个地址</p>
            )}
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
                <label className="text-sm text-gray-400">
                  收货人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入收货人姓名"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">
                  手机号 <span className="text-red-500">*</span>
                </label>
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
                  <label className="text-sm text-gray-400">
                    省份 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="省"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    城市 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="市"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    区县 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="区"
                    maxLength={50}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">
                  详细地址 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  rows={3}
                  placeholder="请输入详细地址"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.detail?.length || 0}/200
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">邮编</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, postcode: value })
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入邮编（选填）"
                  maxLength={6}
                />
              </div>

              {addresses.length === 0 && !editingAddress && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    id="setDefault"
                    checked={true}
                    disabled
                    className="w-4 h-4"
                  />
                  <label htmlFor="setDefault">
                    设为默认地址（第一个地址自动设为默认）
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                取消
              </PixelButton>
              <PixelButton
                className="flex-1"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? '保存中...' : '保存'}
              </PixelButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
