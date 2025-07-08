'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'

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

const taskTypeColors = {
  mining: 'from-orange-500 to-red-500',
  farming: 'from-green-500 to-emerald-500',
  building: 'from-blue-500 to-purple-500'
}

const taskTypeIcons = {
  mining: '⛏️',
  farming: '🌾',
  building: '🏗️'
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  return (
    <PixelCard className="p-6">
      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
        <span>⚡</span>
        进行中的任务
      </h3>
      
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-gray-800 p-4 rounded hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{taskTypeIcons[task.type]}</span>
                <div>
                  <h4 className="font-bold">{task.name}</h4>
                  <p className="text-xs text-gray-400">剩余时间: {task.timeLeft}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">奖励</p>
                <p className="text-sm font-bold text-gold-500">{task.reward}</p>
              </div>
            </div>
            
            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${taskTypeColors[task.type]}`}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5 }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {task.progress}%
              </span>
            </div>
            
            {task.progress === 100 && (
              <motion.button
                className="mt-2 w-full px-3 py-1 bg-green-500 text-white font-bold text-sm rounded hover:bg-green-400 transition-colors"
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
