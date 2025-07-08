// import { AuthPage } from '@/components/auth/AuthComponents'

// export default function LoginPage() {
//   return <AuthPage type="login" />
// }
// 在 login/page.tsx 中
import { AuthPage } from '@/components/auth/AuthComponents'
import { TestLoginForm } from '@/components/TestLoginForm'

export default function LoginPage() {
  return (
    <>
      <AuthPage type="login" />
      {/* 临时添加测试组件 */}
      {process.env.NODE_ENV === 'development' && <TestLoginForm />}
    </>
  )
}
