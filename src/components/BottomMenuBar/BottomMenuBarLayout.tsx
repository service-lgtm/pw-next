/*
 * @Author: yy
 * @Date: 2025-09-19 20:55:05
 * @LastEditTime: 2025-09-19 22:10:31
 * @LastEditors: yy
 * @Description: 
 */

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react';

interface BottomMenuBarLayoutProps {
    children: React.ReactNode;
}

/** 底部菜单栏布局 */
const BottomMenuBarLayout: React.FC<BottomMenuBarLayoutProps> = (props) => {
    const { children } = props;

    // 路由菜单
    const menuList = [
        {
            name: "首页",
            icon: "",
            path: "",
        },
        {
            name: "市场",
            icon: "",
            path: "",
        },
        {
            name: "领地",
            icon: "",
            path: "",
        },
        {
            name: "资产",
            icon: "",
            path: "",
        },
        {
            name: "我的",
            icon: "",
            path: "",
        },
    ]

    return <div className="h-[100dvh]">
        {/* 视图内容 */}
        <div className="h-[calc(100%-var(--bottom-menu-height,58px))] overflow-y-auto">
            {children}
        </div>
        {/* 底部菜单导航 */}
        <AnimatePresence>
            <motion.aside
                initial={{ y: 280 }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className={"w-full h-[var(--bottom-menu-height,58px)] bg-[#1A1A1A] fixed bottom-0 left-0 flex items-center justify-around"}
            >
                {
                    menuList.map((item, index) => {
                        return <div key={index} className="flex flex-col items-center gap-[2px]">
                            <div className="w-[26px] h-[26px] rounded-[10px] bg-[#31261A]"></div>
                            <div className="text-[#E7E7E7] text-[12px]">{item.name}</div>
                        </div>
                    })
                }
            </motion.aside>
        </AnimatePresence>
    </div>
}

/** 用户头像按钮 */
const UserAvatarButton = (props: {
    wapperClassName?: string;
}) => {
    const { wapperClassName } = props

    const { user, logout } = useAuth()
    // 气泡弹窗元素实例
    const dropdownRef = useRef<HTMLDivElement>(null);
    // 用户信息
    const [profileData, setProfileData] = useState<any>(null)
    // 显示用户信息气泡
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    // 显示退出登录确认
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    // 处理推出登录事件
    const handleLogout = async () => {
        await logout()
        setShowLogoutConfirm(false)
    }

    // 获取最新的用户资料
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.accounts.profile()
                if (response.success && response.data) {
                    setProfileData(response.data)
                }
            } catch (error) {
                console.error('获取用户资料失败:', error)
            }
        }

        if (user) {
            fetchProfile()
        }
    }, [user])


    // 使用最新的资料数据或用户数据
    const displayUser = profileData || user
    const tdbBalance = profileData?.tdb_balance ? parseFloat(profileData.tdb_balance) : (user?.tdbBalance || 0)
    const yldBalance = profileData?.yld_balance ? parseFloat(profileData.yld_balance) : (user?.yldBalance || 0)

    // {displayUser?.level_name || `等级 ${displayUser?.level || 1}`}

    return <>
        <div className={cn("relative", wapperClassName)} ref={dropdownRef}>
            <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {displayUser?.nickname?.[0] || displayUser?.username?.[0] || 'U'}
                </div>
            </button>

            {/* 下拉菜单 */}
            <AnimatePresence>
                {showUserDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-[#0A1628] border-4 border-gray-800 rounded-lg shadow-xl z-50"
                    >
                        {/* 用户信息 */}
                        <div className="p-4 border-b-2 border-gray-800">
                            <p className="font-bold text-white">{displayUser?.nickname || displayUser?.username}</p>
                            <p className="text-sm text-gray-400">{displayUser?.masked_email || displayUser?.email}</p>
                            <p className="text-xs text-gold-500 mt-1">推荐码: {displayUser?.referral_code}</p>
                        </div>

                        {/* 快捷菜单 */}
                        <div className="p-2">
                            {/* <div className="mt-2 pt-2"> */}
                            <button
                                onClick={() => {
                                    setShowUserDropdown(false)
                                    setShowLogoutConfirm(true)
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                                <span className="mr-2">🚪</span>
                                退出登录
                            </button>
                            {/* </div> */}
                        </div>

                        {/* 统计信息 */}
                        <div className="p-4 border-t-2 border-gray-800 bg-gray-800/30">
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <p className="text-xs text-gray-400">TDB余额</p>
                                    <p className="text-sm font-bold text-gold-500">
                                        {tdbBalance.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">YLD余额</p>
                                    <p className="text-sm font-bold text-purple-500">
                                        {yldBalance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* 退出确认弹窗 */}
        <AnimatePresence>
            {showLogoutConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0A1628] border-4 border-gray-800 rounded-lg p-6 max-w-sm w-full"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">确认退出</h3>
                        <p className="text-gray-400 mb-6">确定要退出登录吗？</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                确认退出
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
}

export { UserAvatarButton };

export default BottomMenuBarLayout;