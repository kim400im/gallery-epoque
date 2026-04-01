'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Upload, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Artist = {
  id: string
  name: string
  biography: string | null
  introduction: string | null
  createdAt: string
}

type ExhibitionImage = {
  id: string
  imageUrl: string
  description: string | null
  displayOrder: number
}

type ExhibitionArtist = {
  id: string
  artistId: string
  artist: Artist
}

type Exhibition = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  startDate: string
  endDate: string
  createdAt: string
  artists?: ExhibitionArtist[]
  images?: ExhibitionImage[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (exhibition: Exhibition) => void
  editingExhibition?: Exhibition | null
  artists: Artist[]
}

type ImageItem = {
  id: string
  type: 'existing' | 'new'
  previewUrl: string
  description: string
  existingId?: string
  file?: File
}

function SortableImageRow({
  item,
  onRemove,
  onDescriptionChange,
}: {
  item: ImageItem
  onRemove: (id: string) => void
  onDescriptionChange: (id: string, description: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start bg-[#111311] rounded-lg p-2"
    >
      <button
        type="button"
        className="flex-shrink-0 mt-7 cursor-grab active:cursor-grabbing text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="relative flex-shrink-0 w-24 h-24">
        <img
          src={item.previewUrl}
          alt=""
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <input
        type="text"
        value={item.description}
        onChange={(e) => onDescriptionChange(item.id, e.target.value)}
        placeholder="이미지 설명 (선택사항)"
        className="flex-1 px-3 py-2 bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] text-sm placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 mt-1 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

let tempIdCounter = 0
function generateTempId(): string {
  tempIdCounter += 1
  return `temp-${Date.now()}-${tempIdCounter}`
}

export default function ExhibitionModal({ isOpen, onClose, onSuccess, editingExhibition, artists }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!editingExhibition

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (editingExhibition) {
      setTitle(editingExhibition.title)
      setDescription(editingExhibition.description || '')
      setStartDate(editingExhibition.startDate ? editingExhibition.startDate.split('T')[0] : '')
      setEndDate(editingExhibition.endDate ? editingExhibition.endDate.split('T')[0] : '')
      setPreview(editingExhibition.imageUrl)
      const artistIds = editingExhibition.artists?.map(ea => ea.artistId) || []
      setSelectedArtistIds(artistIds)
      const sortedImages = [...(editingExhibition.images || [])].sort(
        (a, b) => a.displayOrder - b.displayOrder
      )
      setImageItems(
        sortedImages.map((img) => ({
          id: img.id,
          type: 'existing' as const,
          previewUrl: img.imageUrl,
          description: img.description || '',
          existingId: img.id,
        }))
      )
      setDeleteImageIds([])
    }
  }, [editingExhibition])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      const itemId = generateTempId()
      reader.onloadend = () => {
        setImageItems((prev) => [
          ...prev,
          {
            id: itemId,
            type: 'new' as const,
            previewUrl: reader.result as string,
            description: '',
            file,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = ''
    }
  }

  const removeImageItem = useCallback((itemId: string) => {
    setImageItems((prev) => {
      const item = prev.find((i) => i.id === itemId)
      if (item?.type === 'existing' && item.existingId) {
        setDeleteImageIds((ids) => [...ids, item.existingId!])
      }
      return prev.filter((i) => i.id !== itemId)
    })
  }, [])

  const updateImageDescription = useCallback((itemId: string, newDescription: string) => {
    setImageItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, description: newDescription } : item
      )
    )
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setImageItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  const handleArtistToggle = (artistId: string) => {
    setSelectedArtistIds(prev => {
      if (prev.includes(artistId)) {
        return prev.filter(id => id !== artistId)
      } else {
        return [...prev, artistId]
      }
    })
  }

  const removeSelectedArtist = (artistId: string) => {
    setSelectedArtistIds(prev => prev.filter(id => id !== artistId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !startDate || !endDate) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (!isEditMode && !image) {
      setError('대표 이미지를 업로드해주세요.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 이후여야 합니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let imageUrl: string | undefined
      if (image) {
        imageUrl = await uploadImageToStorage(image, 'exhibitions')
      }

      const newItems = imageItems.filter((item) => item.type === 'new')
      const existingItems = imageItems.filter((item) => item.type === 'existing')

      const uploadedAdditionalImages = await Promise.all(
        newItems
          .filter((item) => item.file)
          .map(async (item) => ({
            url: await uploadImageToStorage(item.file!, 'exhibitions'),
            description: item.description,
          }))
      )

      const body: Record<string, unknown> = {
        title,
        description,
        startDate,
        endDate,
        imageUrl,
        artistIds: selectedArtistIds,
        additionalImages: uploadedAdditionalImages,
      }

      if (isEditMode) {
        body.id = editingExhibition.id
        body.deleteImageIds = deleteImageIds

        const existingDescriptions: Record<string, string> = {}
        existingItems.forEach((item) => {
          if (item.existingId) {
            existingDescriptions[item.existingId] = item.description
          }
        })
        body.existingImageDescriptions = existingDescriptions

        body.existingImageOrder = existingItems.map((item, index) => ({
          id: item.existingId!,
          displayOrder: index,
        }))

        body.newImageStartOrder = existingItems.length
      }

      const response = await fetch('/api/exhibitions', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `전시회 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
      }

      const exhibition = await response.json()
      onSuccess(exhibition)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `전시회 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setSelectedArtistIds([])
    setImage(null)
    setPreview(null)
    setImageItems([])
    setDeleteImageIds([])
    setError(null)
    onClose()
  }

  const availableArtists = artists
    .filter(artist => !selectedArtistIds.includes(artist.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#f8f4e3] font-[var(--font-cormorant)]">
            {isEditMode ? '전시회 수정' : '전시회 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm text-[#ccc5b9] mb-2">
              전시회 이름
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors"
              placeholder="전시회 이름을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-[#ccc5b9] mb-2">
              전시 설명 <span className="text-[#7c8d4c]">(선택사항)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors resize-none"
              placeholder="전시에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm text-[#ccc5b9] mb-2">
              작가 <span className="text-[#7c8d4c]">(여러 명 선택 가능)</span>
            </label>
            
            {selectedArtistIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedArtistIds
                  .map(artistId => artists.find(a => a.id === artistId))
                  .filter((artist): artist is NonNullable<typeof artist> => artist !== undefined)
                  .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                  .map(artist => (
                    <span
                      key={artist.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#7c8d4c]/20 border border-[#7c8d4c]/30 rounded-full text-sm text-[#f8f4e3]"
                    >
                      {artist.name}
                      <button
                        type="button"
                        onClick={() => removeSelectedArtist(artist.id)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <select
              id="artist"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleArtistToggle(e.target.value)
                }
              }}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
            >
              <option value="">
                {availableArtists.length > 0 
                  ? '작가를 선택하세요 (선택사항)' 
                  : '모든 작가가 선택되었습니다'}
              </option>
              {availableArtists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm text-[#ccc5b9] mb-2">
                시작일
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-[#ccc5b9] mb-2">
                종료일
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              대표 이미지 {isEditMode && <span className="text-[#7c8d4c]">(선택사항)</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setPreview(isEditMode ? editingExhibition?.imageUrl || null : null)
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-[#7c8d4c] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#6a7a40] transition-colors"
                  >
                    변경
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-[#7c8d4c]/30 rounded-lg flex flex-col items-center justify-center gap-2 text-[#ccc5b9] hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">클릭하여 대표 이미지 업로드</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              추가 이미지 <span className="text-[#7c8d4c]">(선택사항)</span>
            </label>
            <input
              ref={additionalFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="hidden"
            />

            {imageItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={imageItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 mb-3">
                    {imageItems.map((item) => (
                      <SortableImageRow
                        key={item.id}
                        item={item}
                        onRemove={removeImageItem}
                        onDescriptionChange={updateImageDescription}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <button
              type="button"
              onClick={() => additionalFileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-[#7c8d4c]/30 rounded-lg flex items-center justify-center gap-2 text-[#ccc5b9] hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">추가 이미지 업로드</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-[#7c8d4c]/30 text-[#ccc5b9] rounded-lg hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? '수정 중...' : '등록 중...'}
                </>
              ) : (
                isEditMode ? '수정하기' : '등록하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
