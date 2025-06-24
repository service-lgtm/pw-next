'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  type: 'mining' | 'farming' | 'building'
  name: string
  progress: number
  timeLeft: string
  reward: string
}

interface TaskProgressProps {
  tasks: Task[]
}

const taskIcons = {
  mining: '⛏️',
  farming: '🌾',
  building: '🏗️'
}

const taskColors = {
  mining: 'bg-gray-500',
  farming: 'bg-green-500',
  building: 'bg-blue-500'
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  return (
    <PixelCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          进行中的任务
        </h3>
        <button className="text-sm text-gold-500 hover:underline">
          查看全部 →
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{taskIcons[task.type]}</span>
                <div>
                  <h4 className="font-bold">{task.name}</h4>
                  <p className="text-xs text-gray-400">
                    奖励: <span className="text-gold-500">{task.reward}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{task.progress}%</p>
                <p className="text-xs text-gray-400">剩余 {task.timeLeft}</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full", taskColors[task.type])}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* 操作按钮 */}
            {task.progress === 100 && (
              <motion.button
                className="mt-3 w-full py-2 bg-gold-500 text-black font-bold rounded hover:bg-gold-400 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                领取奖励
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </PixelCard>
  )
}
