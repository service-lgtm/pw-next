import { LegalDocuments } from '@/components/legal/LegalDocuments'

export const metadata = {
  title: '隐私政策 - 平行世界的字符',
  description: '平行世界的字符用户隐私条款',
}

export default function PrivacyPage() {
  return <LegalDocuments initialDoc="privacy" />
}
