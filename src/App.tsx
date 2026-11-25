import { CameraControls, Html, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import {
  Archive,
  ArrowLeft,
  Check,
  Compass,
  CookingPot,
  Copy,
  Crosshair,
  Home,
  Monitor,
  RotateCcw,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { type Point3D, RoomModel } from './components/RoomModel'
import {
  HOTSPOTS,
  type HotspotIconName,
  type HotspotItem,
  OVERVIEW_CAMERA,
} from './data/hotspots'

function HotspotIcon({ name, className }: { name: HotspotIconName; className?: string }) {
  switch (name) {
    case 'monitor':
      return <Monitor aria-hidden="true" className={className} />
    case 'cabinet':
      return <Archive aria-hidden="true" className={className} />
    case 'cooker':
      return <CookingPot aria-hidden="true" className={className} />
  }
}

function RoomLoader() {
  const { progress } = useProgress()
  const progressId = useId()
  const rounded = Math.round(progress)

  return (
    <Html center>
      <div className="flex w-56 flex-col items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-5 py-4 text-center text-zinc-100 shadow-xl backdrop-blur-md">
        <label htmlFor={progressId} className="text-xs font-medium tracking-wide text-zinc-300">
          Memuat ruangan 3D… {rounded}%
        </label>
        <progress
          id={progressId}
          value={rounded}
          max={100}
          className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-indigo-500 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-zinc-800 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-indigo-500 [&::-webkit-progress-value]:transition-all"
        />
      </div>
    </Html>
  )
}

export default function App() {
  const cameraRef = useRef<CameraControls>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [inspectMode, setInspectMode] = useState(false)
  const [lastClickedPoint, setLastClickedPoint] = useState<Point3D | null>(null)
  const [copied, setCopied] = useState(false)

  const activeHotspot: HotspotItem | undefined = HOTSPOTS.find((item) => item.id === activeId)

  // Set posisi & titik fokus awal kamera tepat ke tengah kamar saat pertama kali dimuat
  const handleControlsRef = useCallback((controls: CameraControls | null) => {
    cameraRef.current = controls
    if (controls) {
      void controls.setLookAt(...OVERVIEW_CAMERA.position, ...OVERVIEW_CAMERA.target, false)
    }
  }, [])

  const selectHotspot = useCallback((hotspot: HotspotItem) => {
    void cameraRef.current?.setLookAt(...hotspot.cameraPosition, ...hotspot.position, true)
    setActiveId(hotspot.id)
  }, [])

  const resetCamera = useCallback(() => {
    void cameraRef.current?.setLookAt(...OVERVIEW_CAMERA.position, ...OVERVIEW_CAMERA.target, true)
    setActiveId(null)
  }, [])

  // Tekan Escape untuk menutup panel detail dan kembali ke overview
  useEffect(() => {
    if (!activeId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetCamera()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, resetCamera])

  const handleInspectPoint = useCallback(
    (point: Point3D) => {
      if (!inspectMode) return
      setLastClickedPoint(point)
      setCopied(false)
    },
    [inspectMode],
  )

  const copyCoords = async () => {
    if (!lastClickedPoint) return
    const formatted = `[${lastClickedPoint.join(', ')}]`
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <div className="relative h-dvh w-dvw bg-zinc-950 text-zinc-100 select-none">
      {/* Header Ringkas */}
      <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/75 px-4 py-2 shadow-lg backdrop-blur-md">
          <Compass aria-hidden="true" className="size-5 text-indigo-400" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100">DevSpace 3D</h1>
            <p className="text-xs text-zinc-400">Klik pin objek atau pilih menu di bawah</p>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={inspectMode}
            onClick={() => setInspectMode((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium shadow-md backdrop-blur-md transition ${
              inspectMode
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30'
                : 'border-zinc-800 bg-zinc-900/75 text-zinc-300 hover:bg-zinc-800/80'
            }`}
          >
            <Crosshair aria-hidden="true" className="size-3.5" />
            Cek Koordinat
          </button>

          <button
            type="button"
            onClick={resetCamera}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/75 px-3 py-2 text-xs font-medium text-zinc-200 shadow-md backdrop-blur-md transition hover:bg-zinc-800/80"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Reset Kamera
          </button>
        </div>
      </header>

      {/* Area Utama 3D WebGL */}
      <main className="h-full w-full">
        <Canvas
          camera={{ position: OVERVIEW_CAMERA.position, fov: 45, near: 0.05, far: 50 }}
          dpr={[1, 2]}
          className="touch-none"
        >
          <color attach="background" args={['#09090b']} />

          <Suspense fallback={<RoomLoader />}>
            <RoomModel onInspectPoint={handleInspectPoint} />

            {/* Pin Hotspot Interaktif di Koordinat Kamar */}
            {HOTSPOTS.map((spot) => {
              const isSelected = spot.id === activeId
              return (
                <Html
                  key={spot.id}
                  position={spot.position}
                  center
                  distanceFactor={3.8}
                  zIndexRange={[10, 0]}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectHotspot(spot)}
                    className={`group inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition duration-200 hover:scale-105 ${
                      isSelected
                        ? 'border-indigo-300 bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                        : 'border-zinc-700/90 bg-zinc-900/85 text-zinc-100 hover:border-indigo-400 hover:bg-indigo-600/90'
                    }`}
                  >
                    <span className="relative flex size-2">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                          isSelected ? 'bg-white' : 'bg-indigo-400'
                        }`}
                      />
                      <span
                        className={`relative inline-flex size-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-indigo-400'
                        }`}
                      />
                    </span>
                    <HotspotIcon
                      name={spot.icon}
                      className={`size-3.5 ${isSelected ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`}
                    />
                    <span>{spot.label}</span>
                  </button>
                </Html>
              )
            })}
          </Suspense>

          <CameraControls
            ref={handleControlsRef}
            makeDefault
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={0.65}
            maxDistance={7.5}
            smoothTime={0.38}
          />
        </Canvas>
      </main>

      {/* Navigasi Cepat Bawah (Dock 1 Baris Ringkas) */}
      <nav
        aria-label="Navigasi titik ruangan"
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
      >
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-1.5 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            aria-pressed={activeId === null}
            onClick={resetCamera}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              activeId === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Home aria-hidden="true" className="size-3.5" />
            Overview
          </button>

          {HOTSPOTS.map((spot) => {
            const isSelected = spot.id === activeId
            return (
              <button
                key={spot.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectHotspot(spot)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <HotspotIcon name={spot.icon} className="size-3.5" />
                {spot.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Alat Bantu Cek Koordinat (Aktif saat tombol Cek Koordinat dinyalakan) */}
      <AnimatePresence>
        {inspectMode && (
          <motion.aside
            aria-label="Inspektor koordinat 3D"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto absolute bottom-20 left-4 z-10 flex max-w-xs items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-300 shadow-xl backdrop-blur-md sm:left-6"
          >
            <Crosshair aria-hidden="true" className="size-4 shrink-0 text-indigo-400" />
            {lastClickedPoint ? (
              <div className="flex items-center gap-2">
                <span>
                  Titik:{' '}
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-indigo-300">
                    [{lastClickedPoint.join(', ')}]
                  </code>
                </span>
                <button
                  type="button"
                  onClick={copyCoords}
                  aria-label="Salin koordinat"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200 transition hover:bg-zinc-700"
                >
                  {copied ? (
                    <>
                      <Check aria-hidden="true" className="size-3.5 text-emerald-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy aria-hidden="true" className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <span>Klik permukaan kamar untuk mengambil koordinat [x, y, z] baru</span>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Panel Detail Portfolio per Hotspot */}
      <AnimatePresence mode="wait">
        {activeHotspot && (
          <motion.aside
            key={activeHotspot.id}
            aria-label={`Detail ${activeHotspot.label}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.24 }}
            className="pointer-events-auto absolute top-20 right-4 z-20 flex max-h-[calc(100dvh-9.5rem)] w-[min(23rem,calc(100dvw-2rem))] flex-col gap-3.5 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-md sm:right-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                  <HotspotIcon name={activeHotspot.icon} className="size-3" />
                  {activeHotspot.badge}
                </span>
                <h2 className="text-base font-semibold text-zinc-100">{activeHotspot.title}</h2>
              </div>

              <button
                type="button"
                onClick={resetCamera}
                aria-label="Tutup panel dan kembali ke overview"
                className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/70 p-1.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300 select-text">
              {activeHotspot.description}
            </p>

            <ul className="flex flex-col gap-2" role="list">
              {activeHotspot.highlights.map((item) => (
                <li
                  key={item.label}
                  className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-3.5 py-2.5 select-text"
                >
                  <p className="text-xs font-semibold text-zinc-100">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{item.detail}</p>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={resetCamera}
              className="mt-0.5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Kembali ke Overview Kamar
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
