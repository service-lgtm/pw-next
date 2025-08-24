// src/app/land/[landId]/page.tsx
// 极简调试版本 - 不依赖任何外部组件
'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// 直接内联 API 请求
async function fetchLandDetail(id: number) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'
  
  try {
    // 获取 token
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    
    const response = await fetch(`${API_BASE_URL}/assets/lands/${id}/`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[fetchLandDetail] Error:', error)
    throw error
  }
}

export default function LandDetailPage() {
  const params = useParams()
  const landId = Number(params.landId)
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    console.log('[MinimalLandPage] Starting...')
    console.log('[MinimalLandPage] landId:', landId)
    
    if (!landId || isNaN(landId)) {
      setError('Invalid land ID')
      setLoading(false)
      return
    }
    
    const loadData = async () => {
      try {
        console.log('[MinimalLandPage] Fetching land:', landId)
        const data = await fetchLandDetail(landId)
        console.log('[MinimalLandPage] Land data received:', data)
        setLand(data)
      } catch (err: any) {
        console.error('[MinimalLandPage] Error:', err)
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [landId])
  
  // 极简的渲染
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1>Loading...</h1>
        <p>Land ID: {landId}</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111',
        color: '#fff',
        padding: '20px'
      }}>
        <h1 style={{ color: '#f00' }}>Error</h1>
        <p>{error}</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back
        </button>
      </div>
    )
  }
  
  if (!land) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111',
        color: '#fff',
        padding: '20px'
      }}>
        <h1>No Data</h1>
      </div>
    )
  }
  
  // 渐进式渲染测试
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111',
      color: '#fff',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Land Detail (Minimal Version)</h1>
      
      {/* 基本信息 */}
      <div style={{ 
        backgroundColor: '#222',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2>Basic Info</h2>
        <p><strong>ID:</strong> {land.id}</p>
        <p><strong>Land ID:</strong> {land.land_id}</p>
        <p><strong>Status:</strong> {land.status}</p>
        <p><strong>Owner:</strong> {land.owner || 'None'}</p>
        <p><strong>Owned At:</strong> {land.owned_at || 'N/A'}</p>
      </div>
      
      {/* Blueprint 信息 - 小心处理 */}
      {land.blueprint && (
        <div style={{ 
          backgroundColor: '#222',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>Blueprint</h2>
          <p><strong>Type:</strong> {land.blueprint.land_type}</p>
          <p><strong>Display:</strong> {land.blueprint.land_type_display}</p>
          <p><strong>Size:</strong> {land.blueprint.size_sqm} sqm</p>
        </div>
      )}
      
      {/* Region 信息 - 小心处理 */}
      {land.region && (
        <div style={{ 
          backgroundColor: '#222',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>Region</h2>
          <p><strong>Name:</strong> {land.region.name}</p>
          <p><strong>Code:</strong> {land.region.code}</p>
          <p><strong>Type:</strong> {land.region.region_type}</p>
        </div>
      )}
      
      {/* 原始数据 */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ 
          cursor: 'pointer',
          padding: '10px',
          backgroundColor: '#333',
          borderRadius: '5px'
        }}>
          View Raw Data
        </summary>
        <pre style={{ 
          backgroundColor: '#222',
          padding: '20px',
          borderRadius: '10px',
          overflow: 'auto',
          marginTop: '10px',
          fontSize: '12px'
        }}>
          {JSON.stringify(land, null, 2)}
        </pre>
      </details>
      
      {/* 返回按钮 */}
      <button 
        onClick={() => window.history.back()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Go Back
      </button>
    </div>
  )
}
