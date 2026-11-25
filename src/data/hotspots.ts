import type { Point3D } from '../components/RoomModel'

export type HotspotIconName = 'monitor' | 'cabinet' | 'cooker'

export interface HotspotItem {
  id: string
  label: string
  badge: string
  title: string
  description: string
  highlights: { label: string; detail: string }[]
  icon: HotspotIconName
  /** Koordinat titik pin 3D & target arah pandang kamera [x, y, z] */
  position: Point3D
  /** Posisi berhenti kamera saat zoom-in menghadap objek [x, y, z] */
  cameraPosition: Point3D
}

export const OVERVIEW_CAMERA: { position: Point3D; target: Point3D } = {
  position: [3.4, 2.9, 3.4],
  target: [0, 1.0, 0],
}

/**
 * Daftar titik interaktif di dalam kamar.
 * Ubah angka `position` atau `cameraPosition` kapan saja jika ingin menggeser titik.
 */
export const HOTSPOTS: HotspotItem[] = [
  {
    id: 'monitor',
    label: 'Monitor',
    badge: 'Projects & Tech Stack',
    title: 'Meja Kerja & Karya Pilihan',
    description:
      'Pusat eksperimen coding sehari-hari — mulai dari aplikasi full-stack, automasi, hingga web interaktif 3D seperti ruangan ini.',
    highlights: [
      {
        label: 'DevSpace 3D Portfolio',
        detail: 'React 19 • Three.js (R3F + Drei) • Tailwind CSS v4 • Coolify',
      },
      {
        label: 'Featured Project #2',
        detail: 'Ganti teks ini di src/data/hotspots.ts dengan deskripsi & link project kamu.',
      },
    ],
    icon: 'monitor',
    position: [-1.29, 1.15, -0.99],
    cameraPosition: [-0.15, 1.3, -0.88],
  },
  {
    id: 'lemari-putih',
    label: 'Lemari Putih',
    badge: 'Skills & Archive',
    title: 'Tech Stack, Tools & Koleksi',
    description:
      'Rak penyimpanan referensi, perangkat pendukung, serta kumpulan teknologi yang biasa digunakan dalam membangun produk digital.',
    highlights: [
      {
        label: 'Frontend & 3D Web',
        detail: 'TypeScript, React, Next.js, Vite, Tailwind CSS, Three.js',
      },
      {
        label: 'Backend & Infra',
        detail: 'Node.js, PostgreSQL, Supabase, Docker, Self-hosted Coolify VPS',
      },
    ],
    icon: 'cabinet',
    position: [0.12, 1.53, 1.66],
    cameraPosition: [0.15, 1.62, 0.25],
  },
  {
    id: 'rice-cooker',
    label: 'Rice Cooker',
    badge: 'About Me & Contact',
    title: 'Bahan Bakar Ngoding Tengah Malam',
    description:
      'Sudut paling krusial di kamar! Kenalan lebih dekat atau hubungi saya untuk kolaborasi project dan diskusi teknologi.',
    highlights: [
      {
        label: 'Status Saat Ini',
        detail: 'Terbuka untuk kolaborasi project web, AI, dan eksperimen kreatif.',
      },
      {
        label: 'Kontak & Sosial',
        detail: 'Tambahkan link GitHub, LinkedIn, atau email kamu di sini.',
      },
    ],
    icon: 'cooker',
    position: [1.2, 1.18, 0.29],
    cameraPosition: [0.05, 1.42, 0.12],
  },
]
