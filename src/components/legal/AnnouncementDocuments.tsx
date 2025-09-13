'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PixelLogo } from '@/components/ui/PixelLogo'
import { usePathname, useRouter } from 'next/navigation'
import { type Announcement } from '@/lib/api'


enum DocumentType {
    updateAnnouncement = "公告",
    minorProtection = "未成年人信息保护"
}

export function AnnouncementDocuments(props: {
    data: Announcement,
}) {
    const { data } = props;
    const [activeDoc, setActiveDoc] = useState<DocumentType>(DocumentType.updateAnnouncement)

    // 处理文档切换
    const handleDocChange = (doc: DocumentType) => {
        setActiveDoc(doc)
    }

    return (
        <div className="min-h-screen bg-[#0F0F1E] text-white">
            {/* 背景装饰 */}
            <div className="fixed inset-0 pixel-grid opacity-10 z-[-1]" />

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
                                onClick={() => handleDocChange(DocumentType.updateAnnouncement)}
                                className={cn(
                                    'flex-1 py-3 px-6 rounded-md text-sm font-bold transition-all duration-200',
                                    activeDoc === DocumentType.updateAnnouncement
                                        ? 'bg-gold-500 text-black'
                                        : 'text-gray-400 hover:text-white'
                                )}
                            >
                                {DocumentType.updateAnnouncement}
                            </button>
                            <button
                                onClick={() => handleDocChange(DocumentType.minorProtection)}
                                className={cn(
                                    'flex-1 py-3 px-6 rounded-md text-sm font-bold transition-all duration-200',
                                    activeDoc === DocumentType.minorProtection
                                        ? 'bg-gold-500 text-black'
                                        : 'text-gray-400 hover:text-white'
                                )}
                            >
                                {DocumentType.minorProtection}
                            </button>
                        </div>
                    </div>

                    {/* 文档内容 */}
                    <AnimatePresence mode="wait">
                        {activeDoc === DocumentType.updateAnnouncement ? (
                            <motion.div
                                key="terms"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="pixel-card p-8 bg-[#0A1628]/95 backdrop-blur"
                            >
                                <UpdateAnnouncementContent data={data} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="privacy"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="pixel-card p-8 bg-[#0A1628]/95 backdrop-blur"
                            >
                                <MinorProtectionContent />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

// 更新公告
function UpdateAnnouncementContent(props: {
    data: Announcement,
}) {
    const { data } = props;
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-black text-gold-500 mb-6 text-center">
                {data?.title ?? "更新公告"}
            </h1>

            <section className="mb-8 min-h-[200px] max-h-[calc(100vh-500px)] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4 whitespace-pre-wrap break-words">
                    {data?.summary ?? ""}
                </h2>
            </section>

            <div className="mt-4 pt-4 text-end">
                <p>{data?.publish_time ?? ""}</p>
            </div>
        </div>
    )
}

// 未成年人信息保护
function MinorProtectionContent() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-black text-gold-500 mb-6 text-center">
                未成年人的个人信息保护
            </h1>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">1、平行世界的字符非常重视对未成年人个人信息的保护。若您是18周岁以下的未成年人，在使用我们的产品与或服务前，应事先取得您监护人的同意。</h2>

            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">2、对于可能涉及的不满14周岁的儿童个人信息，我们进一步采取以下措施予以保障：</h2>
                <div className="space-y-4 text-gray-300">
                    <h3 className="font-bold text-white mb-2">（1）对于收集到的儿童个人信息，我们除遵守本隐私政策关于用户个人信息的约定外，还会秉持正当必要、知情同意、目的明确、安全保障、依法利用的原则，严格遵循《儿童个人信息网络保护规定》等法律法规的要求进行存储、使用、披露，且不会超过实现收集、使用目的所必须的期限，到期后我们会对儿童个人信息进行删除或匿名化处理。我们会指定专人负责儿童个人信息保护事宜。我们还会制定儿童个人信息保护的内部专门制度。</h3>
                    <h3 className="font-bold text-white mb-2">（2）当您作为监护人为被监护的儿童选择使用平行世界的字符相关服务时，我们可能需要向您收集被监护的儿童个人信息，用于向您履行相关服务之必要。您在使用商品相关信息时可能会主动向我们提供儿童个人信息，请您明确知悉并谨慎选择。</h3>
                    <h3 className="font-bold text-white mb-2">（3）儿童或其监护人有权随时访问和更正儿童个人信息，还可以向我们提出更正和删除的请求。如您对儿童个人信息相关事宜有任何意见、建议或投诉、举报，请联系我们。我们会随时为您提供帮助。</h3>
                </div>
            </section>

            <div className="mt-12 pt-8 text-end">
                <p>平行世界的字符团队</p>
            </div>
        </div>
    )
}
