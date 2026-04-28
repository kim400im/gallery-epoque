'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-[#ccc5b9] hover:text-[#f8f4e3] border border-[#7c8d4c]/30 rounded-lg hover:border-[#7c8d4c] transition-colors"
    >
      로그아웃
    </button>
  )
}
