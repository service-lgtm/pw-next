import { AuthPage } from '@/components/auth/AuthComponents'
import DebugNetwork from '@/components/DebugNetwork'

export default function LoginPage() {
  return (
    <>
      <AuthPage type="login" />
      {process.env.NODE_ENV === 'development' && <DebugNetwork />}
    </>
  )
}
