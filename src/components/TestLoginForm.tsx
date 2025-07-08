// 临时测试组件 - 直接调用 API，绕过 useAuth
import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function TestLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleDirectAPICall = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      console.log('[TestLogin] 开始直接调用 API...')
      console.log('[TestLogin] 数据:', { email, password: '***' })
      
      // 直接调用 API，不经过 useAuth
      const response = await authAPI.login({
        email: email.trim(),
        password: password
      })
      
      console.log('[TestLogin] API 响应:', response)
      setResult(response)
      
      // 如果成功，3秒后跳转
      if (response.user) {
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (err) {
      console.error('[TestLogin] 错误:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleManualFetch = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      console.log('[TestLogin] 手动 fetch 测试...')
      
      const response = await fetch('https://mg.pxsj.net.cn/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      })
      
      console.log('[TestLogin] Fetch 响应状态:', response.status)
      const data = await response.json()
      console.log('[TestLogin] Fetch 响应数据:', data)
      
      setResult(data)
    } catch (err) {
      console.error('[TestLogin] Fetch 错误:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-white">测试登录（绕过 useAuth）</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            placeholder="输入邮箱"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            placeholder="输入密码"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDirectAPICall}
            disabled={loading || !email || !password}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? '处理中...' : '调用 authAPI.login'}
          </button>
          
          <button
            onClick={handleManualFetch}
            disabled={loading || !email || !password}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {loading ? '处理中...' : '手动 fetch'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded">
            <p className="text-red-300 text-sm">错误: {error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded">
            <p className="text-green-300 text-sm">成功！</p>
            <pre className="text-xs mt-2 text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>这个组件直接调用 API，不使用 useAuth hook</p>
        <p>用于测试是 useAuth 的问题还是 API 的问题</p>
      </div>
    </div>
  )
}
