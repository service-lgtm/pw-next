/**
 * 文件: src/app/wallet/layout.tsx
 * 描述: 钱包页面布局文件
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. Next.js 13+ 的布局文件
 * 2. 钱包页面会自动使用 DashboardLayout
 * 
 * 关联文件：
 * - src/app/wallet/page.tsx: 钱包主页面
 * - src/components/dashboard/DashboardLayout.tsx: 仪表盘布局组件
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建
 */

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
