import { useGLTF } from '@react-three/drei'
import { type ThreeEvent, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

// Gunakan decoder Draco lokal di public/draco/ agar cepat dan tidak bergantung CDN luar
useGLTF.setDecoderPath('/draco/')

export type Point3D = [number, number, number]

interface RoomModelProps {
  onInspectPoint?: (point: Point3D) => void
}

export function RoomModel({ onInspectPoint }: RoomModelProps) {
  const { scene } = useGLTF('/models/room.glb', true)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const createdMaterials: THREE.MeshBasicMaterial[] = []
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy()

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const currentMat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial

        // Simpan referensi tekstur asli di userData supaya aman saat Vite HMR reload
        const baseMap: THREE.Texture | null =
          (mesh.userData.baseMap as THREE.Texture | undefined) ?? currentMat.map ?? null

        if (baseMap) {
          mesh.userData.baseMap = baseMap
          baseMap.colorSpace = THREE.SRGBColorSpace
          baseMap.anisotropy = maxAnisotropy
          baseMap.needsUpdate = true
        }

        // Ganti ke MeshBasicMaterial (Unlit) agar tekstur hasil scan tampil cerah 1:1
        // dan pakai THREE.FrontSide agar tembok yang menghalangi kamera otomatis tembus pandang
        const unlitMat = new THREE.MeshBasicMaterial({
          map: baseMap,
          side: THREE.FrontSide,
          toneMapped: false,
        })

        mesh.material = unlitMat
        createdMaterials.push(unlitMat)
      }
    })

    return () => {
      for (const mat of createdMaterials) {
        mat.dispose()
      }
    }
  }, [scene, gl])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Abaikan jika user sedang drag memutar kamera (delta > 4px)
    if (e.delta > 4) return
    e.stopPropagation()

    const coords: Point3D = [
      Number(e.point.x.toFixed(2)),
      Number(e.point.y.toFixed(2)),
      Number(e.point.z.toFixed(2)),
    ]

    console.log('📍 Koordinat klik [x, y, z]:', coords)
    onInspectPoint?.(coords)
  }

  return <primitive object={scene} onClick={handleClick} />
}

useGLTF.preload('/models/room.glb', true)
