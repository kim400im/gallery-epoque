import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PB_AUTH_COOKIE, pbAuthRefresh } from '@/lib/pocketbase'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(PB_AUTH_COOKIE)?.value
  if (!token) redirect('/login')

  try {
    const auth = await pbAuthRefresh(token)
    return <AdminDashboard userEmail={auth.record.email || ''} />
  } catch {
    redirect('/login')
  }
}
