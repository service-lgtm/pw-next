// components/DebugNetwork.tsx
'use client'

import { useState } from 'react'

export default function DebugNetwork() {
  const [results, setResults] = useState<string[]>([])
  
  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }
  
  const clearResults = () => setResults([])
  
  // 测试1: 直接 fetch 登录接口
  const testDirectFetch = async () => {
    addResult('=== 测试直接 Fetch ===')
    try {
      const response = await fetch('https://mg.pxsj.net.cn/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      })
      
      addResult(`响应状态: ${response.status}`)
      const data = await response.json()
      addResult(`响应数据: ${JSON.stringify(data)}`)
    } catch (error) {
      addResult(`错误: ${error}`)
      console.error('Direct fetch error:', error)
    }
  }
  
  // 测试2: 使用您的 API 层
  const testApiLayer = async () => {
    addResult('=== 测试 API 层 ===')
    try {
      const { api } = await import('@/lib/api')
      const response = await api.auth.login({
        email: 'test@example.com',
        password: 'testpassword'
      })
      addResult(`成功: ${JSON.stringify(response)}`)
    } catch (error) {
      addResult(`错误: ${error}`)
      console.error('API layer error:', error)
    }
  }
  
  // 测试3: 对比注册接口
  const testRegisterEndpoint = async () => {
    addResult('=== 测试注册接口（对比） ===')
    try {
      const response = await fetch('https://mg.pxsj.net.cn/api/v1/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
          password_confirm: 'testpassword',
          verification_code: '123456'
        })
      })
      
      addResult(`注册接口响应状态: ${response.status}`)
    } catch (error) {
      addResult(`注册接口错误: ${error}`)
    }
  }
  
  // 测试4: 检查 fetch 状态
  const checkFetchStatus = () => {
    addResult('=== 检查 Fetch 状态 ===')
    addResult(`fetch 是原生的: ${fetch.toString().includes('[native code]')}`)
    addResult(`window.fetch === fetch: ${window.fetch === fetch}`)
    
    // 检查是否有拦截器
    if ('Proxy' in window) {
      try {
        const handler = Object.getOwnPropertyDescriptor(window, 'fetch')
        addResult(`fetch descriptor: ${JSON.stringify(handler)}`)
      } catch (e) {
        addResult(`无法获取 fetch descriptor`)
      }
    }
  }
  
  // 测试5: 使用 XMLHttpRequest
  const testXHR = async () => {
    addResult('=== 测试 XMLHttpRequest ===')
    
    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://mg.pxsj.net.cn/api/v1/auth/login/')
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.withCredentials = true
      
      xhr.onload = () => {
        addResult(`XHR 状态: ${xhr.status}`)
        addResult(`XHR 响应: ${xhr.responseText.substring(0, 100)}...`)
        resolve()
      }
      
      xhr.onerror = () => {
        addResult('XHR 错误')
        resolve()
      }
      
      xhr.send(JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }))
    })
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-[600px] max-h-[400px] bg-gray-900 text-white p-4 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">网络调试工具</h3>
        <button 
          onClick={clearResults}
          className="px-3 py-1 bg-red-600 rounded text-sm"
        >
          清空
        </button>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button 
          onClick={testDirectFetch}
          className="px-3 py-1 bg-blue-600 rounded text-sm"
        >
          直接 Fetch
        </button>
        <button 
          onClick={testApiLayer}
          className="px-3 py-1 bg-green-600 rounded text-sm"
        >
          API 层
        </button>
        <button 
          onClick={testRegisterEndpoint}
          className="px-3 py-1 bg-purple-600 rounded text-sm"
        >
          测试注册接口
        </button>
        <button 
          onClick={checkFetchStatus}
          className="px-3 py-1 bg-yellow-600 rounded text-sm"
        >
          检查 Fetch
        </button>
        <button 
          onClick={testXHR}
          className="px-3 py-1 bg-pink-600 rounded text-sm"
        >
          XMLHttpRequest
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-black p-3 rounded font-mono text-xs">
        {results.length === 0 ? (
          <p className="text-gray-500">点击按钮开始测试...</p>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))
        )}
      </div>
    </div>
  )
}
