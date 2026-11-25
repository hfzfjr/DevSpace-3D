import { Box } from 'lucide-react'
import { motion } from 'motion/react'

export default function App() {
  return (
    <main className="relative flex h-dvh w-dvw items-center justify-center bg-zinc-950 text-zinc-100">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center backdrop-blur-md"
      >
        <Box className="size-8 text-indigo-400" />
        <h1 className="text-lg font-semibold tracking-tight">DevSpace 3D Ready</h1>
        <p className="max-w-xs text-sm text-zinc-400">
          Step 2 selesai — siap lanjut ke Step 3 untuk me-render{' '}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-indigo-300">
            /models/room.glb
          </code>
        </p>
      </motion.div>
    </main>
  )
}
