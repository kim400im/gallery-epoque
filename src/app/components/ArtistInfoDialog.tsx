'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User } from 'lucide-react'

type Artist = {
  id: string
  name: string
  biography: string | null
  introduction: string | null
}

type Props = {
  artist: Artist | null
  isOpen: boolean
  onClose: () => void
}

export default function ArtistInfoDialog({ artist, isOpen, onClose }: Props) {
  if (!artist) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="bg-[#1a1c1a] border-[#7c8d4c]/30 text-[#f8f4e3] max-w-lg max-h-[80vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-[var(--font-cormorant)] text-[#f8f4e3]">
            <User className="w-6 h-6 text-[#d4af37]" />
            {artist.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* 약력 */}
          {artist.biography && (
            <div>
              <h3 className="text-sm font-medium text-[#7c8d4c] mb-2 tracking-wider uppercase">
                약력
              </h3>
              <p className="text-[#ccc5b9] leading-relaxed whitespace-pre-wrap">
                {artist.biography}
              </p>
            </div>
          )}

          {/* 소개 */}
          {artist.introduction && (
            <div>
              <h3 className="text-sm font-medium text-[#7c8d4c] mb-2 tracking-wider uppercase">
                소개
              </h3>
              <p className="text-[#ccc5b9] leading-relaxed whitespace-pre-wrap">
                {artist.introduction}
              </p>
            </div>
          )}

          {/* 약력과 소개가 모두 없을 경우 */}
          {!artist.biography && !artist.introduction && (
            <p className="text-[#ccc5b9]/70 text-center py-4">
              등록된 작가 정보가 없습니다.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
