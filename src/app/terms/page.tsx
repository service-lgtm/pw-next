import { LegalDocuments } from '@/components/legal/LegalDocuments'

export const metadata = {
  title: '用户协议 - 平行世界的字符',
  description: '平行世界的字符用户服务条款',
}

export default function TermsPage() {
  return <LegalDocuments initialDoc="terms" />
}
