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

  try {
    const auth = await pbAuthRefresh(token)
    console.log('[admin] auth refresh success:', auth.record.email)
    return <AdminDashboard userEmail={auth.record.email || ''} />
  } catch (e) {
    console.log('[admin] auth refresh failed:', e)
    redirect('/login')
  }
}
