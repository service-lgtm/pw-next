// src/components/providers/ToasterProvider.tsx
// Toast 通知提供者组件

'use client'

import { Toaster } from 'react-hot-toast'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // 默认选项
        duration: 4000,
        style: {
          background: '#0A1628',
          color: '#fff',
          border: '2px solid #FFD700',
          padding: '16px',
          fontSize: '14px',
          boxShadow: '4px 4px 0 0 rgba(0,0,0,0.3)',
        },
        
        // 成功消息样式
        success: {
          duration: 3000,
          style: {
            border: '2px solid #00D4AA',
          },
          iconTheme: {
            primary: '#00D4AA',
            secondary: '#0A1628',
          },
        },
        
        // 错误消息样式
        error: {
          duration: 5000,
          style: {
            border: '2px solid #EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#0A1628',
          },
        },
        
        // 加载消息样式
        loading: {
          style: {
            border: '2px solid #3B82F6',
          },
        },
      }}
    />
  )
}
