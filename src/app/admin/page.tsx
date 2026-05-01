import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PB_AUTH_COOKIE, pbAuthRefresh } from '@/lib/pocketbase'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(PB_AUTH_COOKIE)?.value
  console.log('[admin] token exists:', !!token)
  if (!token) {
    console.log('[admin] no token, redirecting to login')
    redirect('/login')
  }

  const auth = await pbAuthRefresh(token).catch((e) => {
    console.log('[admin] auth refresh failed:', e)
    return null
  })

  if (!auth) redirect('/login')

  console.log('[admin] auth refresh success:', auth.record.email)
  return <AdminDashboard userEmail={auth.record.email || ''} />
}
