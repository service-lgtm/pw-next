import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 需要认证的路径
const protectedPaths = [
  '/dashboard',
  '/assets',
  '/mining',
  '/market',
  '/shop',
  '/wallet'
]

// 公开路径（未登录可访问）
const publicPaths = [
  '/login',
  '/register',
  '/reset-password'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  )
  
  if (isProtectedPath || isPublicPath) {
    try {
      // 检查认证状态
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'}/auth/status/`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      const isAuthenticated = data.authenticated
      
      // 如果是受保护路径但未认证，重定向到登录页
      if (isProtectedPath && !isAuthenticated) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
      
      // 如果是公开路径但已认证，重定向到仪表盘
      if (isPublicPath && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // 如果检查失败，保守处理：受保护路径重定向到登录页
      if (isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)'
  ]
}
