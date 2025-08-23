// src/components/explore/DebugLandDrawer.tsx
import React from 'react'
import { LandDetailDrawer } from './LandDetailDrawer'

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    console.error('[ErrorBoundary] Caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[ErrorBoundary] Error details:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-red-900 p-6 rounded-lg max-w-lg">
            <h2 className="text-xl font-bold text-white mb-2">渲染错误</h2>
            <pre className="text-xs text-red-200 overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function DebugLandDrawer(props: any) {
  // 添加安全检查
  if (!props) {
    console.error('[DebugLandDrawer] No props received!')
    return null
  }
  
  console.log('[DebugLandDrawer] Props:', props)
  console.log('[DebugLandDrawer] land:', props.land)
  console.log('[DebugLandDrawer] landId:', props.landId)
  console.log('[DebugLandDrawer] isOpen:', props.isOpen)
  
  // 如果 props 不存在或 isOpen 为 false，不渲染
  if (!props.isOpen) {
    return null
  }
  
  return (
    <ErrorBoundary>
      <LandDetailDrawer {...props} />
    </ErrorBoundary>
  )
}
