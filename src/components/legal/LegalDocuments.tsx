'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PixelLogo } from '@/components/ui/PixelLogo'
import { usePathname, useRouter } from 'next/navigation'

type DocumentType = 'terms' | 'privacy'

export function LegalDocuments({ initialDoc = 'terms' }: { initialDoc?: DocumentType }) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeDoc, setActiveDoc] = useState<DocumentType>(initialDoc)

  // 根据当前路径设置活动文档
  useEffect(() => {
    if (pathname === '/privacy') {
      setActiveDoc('privacy')
    } else if (pathname === '/terms') {
      setActiveDoc('terms')
    }
  }, [pathname])

  // 处理文档切换
  const handleDocChange = (doc: DocumentType) => {
    setActiveDoc(doc)
    // 使用路由导航到对应页面
    router.push(`/${doc}`)
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pixel-grid opacity-10" />
      
      {/* 头部导航 */}
      <header className="fixed top-0 left-0 right-0 bg-[#0A1628]/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <PixelLogo />
              </motion.div>
              <span className="text-xl font-black text-gold-500 group-hover:text-gold-400 transition-colors">
                平行世界
              </span>
            </Link>
            
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-gold-500 hover:text-gold-400 transition-colors"
            >
              返回登录
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="pt-24 pb-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 文档切换标签 */}
          <div className="mb-8">
            <div className="flex rounded-lg bg-gray-800/50 p-1 max-w-md mx-auto">
              <button
                onClick={() => handleDocChange('terms')}
                className={cn(
                  'flex-1 py-3 px-6 rounded-md text-sm font-bold transition-all duration-200',
                  activeDoc === 'terms'
                    ? 'bg-gold-500 text-black'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                用户协议
              </button>
              <button
                onClick={() => handleDocChange('privacy')}
                className={cn(
                  'flex-1 py-3 px-6 rounded-md text-sm font-bold transition-all duration-200',
                  activeDoc === 'privacy'
                    ? 'bg-gold-500 text-black'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                隐私政策
              </button>
            </div>
          </div>

          {/* 文档内容 */}
          <AnimatePresence mode="wait">
            {activeDoc === 'terms' ? (
              <motion.div
                key="terms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pixel-card p-8 bg-[#0A1628]/95 backdrop-blur"
              >
                <TermsContent />
              </motion.div>
            ) : (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pixel-card p-8 bg-[#0A1628]/95 backdrop-blur"
              >
                <PrivacyContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// 用户协议内容（保持不变）
function TermsContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-black text-gold-500 mb-6 text-center">
        平行世界的字符用户服务条款
      </h1>
      
      <p className="text-gray-300 mb-6">
        欢迎您使用平行世界的字符（以下简称"本平台"）提供的各项服务。本用户服务条款（以下简称"本条款"）是您与本平台之间关于使用本平台服务所订立的协议。请您在使用本平台服务前仔细阅读本条款，您对本平台服务的使用行为将被视为您已接受本条款的全部内容。
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">一、服务内容</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台为用户提供的服务包括但不限于信息发布与浏览、在线交流互动、资源共享、线上交易（如适用）等，具体服务内容以本平台实际提供为准。</li>
          <li>本平台有权根据技术发展、市场需求及运营规划等情况，对服务内容进行调整、更新或终止，相关变动将通过平台公告等方式通知用户。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">二、用户账号</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-bold text-white mb-2">1、账号注册</h3>
            <p>您在使用本平台部分服务前，需按照平台要求完成账号注册。注册时应提供真实、准确、完整的信息，如信息发生变更，应及时更新。因提供虚假信息导致的一切后果，由您自行承担。</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">2、账号管理</h3>
            <p>您应对自己的账号及密码的安全负责，不得将账号转借、出租或出售给他人使用。如发现账号异常登录或被盗用，应立即通知本平台并采取相应措施，本平台将协助您进行处理，但不承担因账号被盗用造成的直接或间接损失。</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">3、账号注销</h3>
            <p>您有权根据本平台规定的流程注销账号。账号注销后，您将无法再使用该账号登录本平台，且与该账号相关的部分数据可能被删除或匿名化处理（法律法规另有规定的除外）。</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">三、用户使用规范</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>
            您在使用本平台服务时，应遵守国家法律法规、社会公德及本条款的规定，不得利用本平台从事任何违法违规活动，包括但不限于：
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>发布、传播含有违法、色情、暴力、恐怖、诽谤、谣言等内容的信息；</li>
              <li>侵犯他人的知识产权、肖像权、名誉权等合法权益；</li>
              <li>恶意攻击、破坏本平台的系统或干扰其他用户的正常使用；</li>
              <li>进行虚假交易、欺诈等行为。</li>
            </ul>
          </li>
          <li>您应保证在本平台发布的信息真实、合法、有效，对所发布信息的内容及后果承担全部责任。</li>
          <li>本平台有权对您在使用服务过程中的行为进行监督，如发现您违反本条款或法律法规的规定，有权采取警告、删除信息、暂停或终止账号使用等措施，并保留追究您法律责任的权利。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">四、知识产权</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台所包含的文字、图片、音频、视频、软件、技术等所有内容及知识产权均归本平台或相关权利人所有，受法律保护。</li>
          <li>未经本平台书面许可，您不得擅自复制、传播、改编、展示或利用本平台的任何内容，不得以任何形式侵犯本平台的知识产权。</li>
          <li>您在本平台发布的原创内容，其知识产权归您所有，但您授予本平台免费、非独家、可转授权的使用权，本平台可在本平台范围内使用该内容。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">五、免责声明</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台仅为用户提供信息发布和交流的平台，不对用户发布信息的真实性、准确性、完整性负责，用户因依赖该等信息所遭受的损失，本平台不承担责任。</li>
          <li>因不可抗力、网络故障、黑客攻击等非本平台可控因素导致本平台服务中断或无法正常提供的，本平台不承担责任，但将尽力采取补救措施。</li>
          <li>您在使用本平台服务过程中与其他用户发生的纠纷，由您自行解决，本平台不承担责任，但可根据用户请求提供必要的协助。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">六、服务的变更、中断与终止</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台有权根据实际情况变更服务内容或中断部分服务，如该等变更或中断将对用户权益产生重大影响，本平台将提前通过平台公告等方式通知用户。</li>
          <li>如您违反本条款的规定，本平台有权随时终止向您提供服务，且不退还任何已支付的费用（如适用）。</li>
          <li>本平台如因业务调整、运营不善等原因需要终止全部服务的，将提前通知用户，并按照相关法律法规的规定处理善后事宜。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">七、条款的修改</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台有权根据法律法规的变化、服务的更新等情况对本条款进行修改。</li>
          <li>修改后的条款将通过平台公告等方式发布，自发布之日起生效。如您继续使用本平台服务，即视为您同意修改后的条款；如您不同意，可停止使用本平台服务。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">八、法律适用与争议解决</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本条款的订立、效力、解释及执行均适用中华人民共和国法律。</li>
          <li>因本条款引起的或与本条款有关的任何争议，双方应首先通过友好协商解决；协商不成的，任何一方均有权向本平台所在地有管辖权的人民法院提起诉讼。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">九、其他</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台的公告、规则等为本条款的组成部分，与本条款具有同等法律效力。</li>
          <li>如本条款中的任何条款被认定为无效或不可执行，不影响其他条款的效力。</li>
          <li>如您对本条款有任何疑问，可通过本平台公布的联系方式与我们联系。</li>
        </ol>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
        <p>本用户服务条款自发布之日起生效。</p>
        <p className="mt-2">平行世界的字符</p>
        <p>2025年5月28日</p>
      </div>
    </div>
  )
}

// 隐私政策内容（保持不变）
function PrivacyContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-black text-gold-500 mb-6 text-center">
        平行世界的字符用户隐私条款
      </h1>
      
      <p className="text-gray-300 mb-6">
        欢迎使用平行世界的字符（以下简称"本平台"）。本平台尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更个性化的服务，本平台会按照本隐私条款的规定收集、使用、存储和保护您的个人信息。您在使用本平台的服务时，即视为您同意本隐私条款的全部内容。
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">一、适用范围</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本隐私条款适用于本平台提供的所有服务，包括但不限于平台注册、登录、信息发布、互动交流等功能。</li>
          <li>除本隐私条款另有规定外，本平台的其他服务条款及声明等均不构成对本隐私条款的修改或替代。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">二、信息收集</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-bold text-white mb-2">1、基本信息</h3>
            <p>当您注册本平台账号时，我们可能会收集您的姓名、手机号码、电子邮箱等信息，以便为您创建账号、提供身份验证服务。</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">2、使用信息</h3>
            <p>在您使用本平台服务的过程中，我们会收集您的登录日志、浏览记录、操作行为等信息，用于分析您的使用习惯，为您提供更符合需求的服务。</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">3、设备信息</h3>
            <p>为了保障服务的正常运行，我们可能会收集您使用的设备型号、操作系统版本、设备标识符、网络状态等信息。</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">4、其他信息</h3>
            <p>在您参与本平台的活动、投诉举报或与我们联系时，我们可能会收集您提供的相关信息，如活动参与信息、投诉内容等。</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">三、信息使用</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>我们会根据收集的信息为您提供本平台的各项服务，包括但不限于账号管理、内容推荐、服务通知等。</li>
          <li>为了改进本平台的服务质量，我们会对收集的信息进行分析和研究，用于优化平台功能、提升用户体验。</li>
          <li>在获得您的明确同意后，我们可能会将您的信息用于市场推广、活动宣传等目的，但会确保您的信息安全。</li>
          <li>我们可能会根据法律法规的要求或政府部门的指令，使用您的个人信息。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">四、信息存储</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>您的个人信息将存储在本平台的服务器中，我们会采取合理的安全措施保护您的信息，防止信息丢失、泄露、篡改等。</li>
          <li>您的个人信息存储期限将根据法律法规的要求及服务的需要确定，在存储期限届满后，我们会依法删除或匿名化处理您的信息。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">五、信息保护</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台采用多种安全技术和措施，如加密技术、访问控制、安全审计等，保障您的个人信息安全。</li>
          <li>我们会对员工进行信息安全培训，严格限制员工对个人信息的访问权限，防止信息被滥用。</li>
          <li>如发生信息泄露等安全事件，我们会及时采取补救措施，并按照法律法规的要求向您及相关部门报告。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">六、信息披露</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>未经您的明确同意，本平台不会向任何第三方披露您的个人信息，除非法律法规另有规定或为了保护本平台及其他用户的合法权益。</li>
          <li>我们可能会将您的信息与我们的关联公司共享，但会要求关联公司遵守本隐私条款的规定，保护您的信息安全。</li>
          <li>在本平台进行合并、收购、资产转让等交易时，您的个人信息可能会作为交易的一部分被转移，我们会确保受让方遵守本隐私条款的规定。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">七、用户权利</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>您有权随时查询、修改您的个人信息，您可以通过平台的相关功能进行操作。</li>
          <li>您有权注销您的平台账号，账号注销后，我们会删除或匿名化处理您的个人信息，但法律法规另有规定的除外。</li>
          <li>如您发现我们收集、使用您的个人信息违反了本隐私条款或法律法规的规定，您有权向我们投诉举报。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">八、条款修改</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>本平台可能会根据法律法规的变化、服务的更新等情况，对本隐私条款进行修改。</li>
          <li>当本隐私条款发生修改时，我们会通过平台公告、站内信等方式通知您，您可以随时查阅最新的隐私条款。</li>
          <li>如您继续使用本平台的服务，即视为您同意修改后的隐私条款；如您不同意，您可以停止使用本平台的服务。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">九、联系我们</h2>
        <p className="text-gray-300 mb-4">
          如您对本隐私条款有任何疑问或建议，欢迎通过以下方式联系我们：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>电子邮箱：pxsj141319@163.com</li>
          <li>联系地址：深圳市福田区福田街道福山社区金田路2030号卓越世纪中心、皇岗商务中心4号楼3006F</li>
        </ul>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
        <p>本隐私条款自发布之日起生效。</p>
        <p className="mt-2">平行世界的字符</p>
        <p>2025年5月28日</p>
      </div>
    </div>
  )
}
