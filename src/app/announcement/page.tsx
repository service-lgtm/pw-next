/*
 * @Author: yy
 * @Date: 2025-09-12 23:22:07
 * @LastEditTime: 2025-09-13 21:01:48
 * @LastEditors: yy
 * @Description: 
 */
import { AnnouncementDocuments } from '@/components/legal/AnnouncementDocuments'
import api, { type Announcement } from '@/lib/api'

export async function generateMetadata() {
    return {
        title: '更新公告 - 平行世界的字符',
        description: '平行世界的字符更新公告',
    };
}

export default async function announcementPage() {

    const props = {
        announcementInfo: {} as Announcement,
    }

    try {
        // 获取最新更新公告
        const res = await api.system.getLatestTips();

        // 公告第一项
        const announcement = res?.data?.[0] ?? {};

        props.announcementInfo = announcement;
    } catch (error) {
        console.log(error)
    }
    return <AnnouncementDocuments data={props.announcementInfo} />
}
