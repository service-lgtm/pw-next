// src/app/trading/layout.tsx
// 交易市场布局组件
// 版本：1.0.0 - 为交易市场页面提供统一布局

/**
 * ============================================
 * 文件创建说明
 * ============================================
 * 创建原因：确保交易市场页面使用 Dashboard 布局
 * 主要功能：
 * 1. 提供统一的页面结构
 * 2. 确保侧边栏正确显示
 * 3. 支持页面元数据设置
 * 
 * 依赖关系：
 * - 被所有 /trading/* 页面使用
 * - 依赖 DashboardLayout 组件
 * 
 * ⚠️ 重要说明：
 * - 此文件确保交易市场页面与其他功能页面保持一致
 * - 支持 Next.js 13+ App Router
 * ============================================
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '交易市场 - 平行世界',
  description: 'C2C 材料和工具交易平台'
}

export default function TradingLayout({
  children
}: {
  children: React.ReactNode
}) {
  // DashboardLayout 已经在 ClientLayout 中处理
  // 这里只需要返回 children
  return <>{children}</>
}
