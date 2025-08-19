// src/app/synthesis/layout.tsx
// 合成系统布局文件
//
// 功能说明：
// 1. 为合成系统页面提供统一布局
// 2. 可以在这里添加合成系统专用的导航或侧边栏
// 3. 设置页面元数据
//
// 创建时间：2024-12-26

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '合成工坊 - 平行世界',
  description: '使用资源合成工具和材料，提升生产效率',
  keywords: '合成,工具,材料,砖头,镐头,斧头,锄头',
}

export default function SynthesisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
