import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 让所有认证检查都在客户端进行
  // middleware 只负责基本的路由规则
  
  // 可以在这里添加其他中间件逻辑
  // 比如：重定向、添加 headers 等
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)*'
  ]
}
