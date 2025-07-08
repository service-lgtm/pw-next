// app/test-login/page.tsx
// 完全独立的测试页面，不使用任何共享组件

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 测试1: 检查环境
  const checkEnvironment = () => {
    console.log('=== 环境检查 ===')
    console.log('fetch 是否原生:', fetch.toString().includes('[native code]'))
    console.log('window.fetch === fetch:', window.fetch === fetch)
    console.log('当前 URL:', window.location.href)
    console.log('User Agent:', navigator.userAgent)
    
    // 检查全局对象
    console.log('全局对象检查:')
    console.log('- window.__NEXT_DATA__:', typeof (window as any).__NEXT_DATA__)
    console.log('- window.Prototype:', typeof (window as any).Prototype)
    
    setResult({
      type: 'environment',
      fetchIsNative: fetch.toString().includes('[native code]'),
      url: window.location.href
    })
  }

  // 测试2: 原始 fetch
  const testRawFetch = async () => {
    setLoading(true)
    try {
      console.log('=== 测试原始 fetch ===')
      
      const response = await fetch('https://mg.pxsj.net.cn/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      console.log('响应:', data)
      
      setResult({
        type: 'raw_fetch',
        status: response.status,
        data
      })
    } catch (error) {
      console.error('错误:', error)
      setResult({
        type: 'raw_fetch',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试3: 动态导入 API
  const testDynamicImport = async () => {
    setLoading(true)
    try {
      console.log('=== 测试动态导入 ===')
      
      // 动态导入，避免任何提前的修改
      const { authAPI } = await import('@/lib/api')
      
      const response = await authAPI.login({ email, password })
      console.log('响应:', response)
      
      setResult({
        type: 'dynamic_import',
        data: response
      })
    } catch (error) {
      console.error('错误:', error)
      setResult({
        type: 'dynamic_import',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试4: 创建 iframe 获取原生 fetch
  const testIframeFetch = async () => {
    setLoading(true)
    try {
      console.log('=== 测试 iframe fetch ===')
      
      // 创建隐藏的 iframe
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
      
      // 获取 iframe 的 fetch
      const iframeFetch = iframe.contentWindow?.fetch
      
      if (!iframeFetch) {
        throw new Error('无法获取 iframe fetch')
      }
      
      console.log('iframe fetch 是否原生:', iframeFetch.toString().includes('[native code]'))
      
      // 使用 iframe 的 fetch
      const response = await iframeFetch('https://mg.pxsj.net.cn/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      console.log('响应:', data)
      
      // 清理
      document.body.removeChild(iframe)
      
      setResult({
        type: 'iframe_fetch',
        status: response.status,
        data
      })
    } catch (error) {
      console.error('错误:', error)
      setResult({
        type: 'iframe_fetch',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">登录测试页面</h1>
      
      <div className="max-w-2xl space-y-6">
        {/* 输入区域 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">测试账号</h2>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded"
          />
        </div>

        {/* 测试按钮 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">测试选项</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={checkEnvironment}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              检查环境
            </button>
            <button
              onClick={testRawFetch}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              测试原始 Fetch
            </button>
            <button
              onClick={testDynamicImport}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              测试动态导入
            </button>
            <button
              onClick={testIframeFetch}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded disabled:opacity-50"
            >
              测试 Iframe Fetch
            </button>
          </div>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">测试结果</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
