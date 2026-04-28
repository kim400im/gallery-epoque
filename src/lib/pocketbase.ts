import { NextRequest, NextResponse } from 'next/server'

export const PB_AUTH_COOKIE = 'pb_auth'

const pbUrl = () =>
  (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '')

export const pbPublicUrl = () =>
  (process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '')

type RequestOptions = RequestInit & { token?: string }

export async function pbRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (options.token) headers.set('Authorization', options.token)

  const res = await fetch(`${pbUrl()}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${text}`)
  }

  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export function getAuthToken(request: NextRequest) {
  return request.cookies.get(PB_AUTH_COOKIE)?.value
}

export function requireAuthToken(request: NextRequest) {
  const token = getAuthToken(request)
  if (!token) return null
  return token
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function pbLogin(identity: string, password: string) {
  return pbRequest<{ token: string; record: { email?: string } }>('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity, password }),
  })
}

let cachedSuperuserToken: string | null = null

export async function getServerSuperuserToken() {
  if (cachedSuperuserToken) return cachedSuperuserToken
  if (process.env.POCKETBASE_SUPERUSER_TOKEN) return process.env.POCKETBASE_SUPERUSER_TOKEN
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD
  if (!email || !password) throw new Error('PocketBase superuser credentials are required.')
  const auth = await pbLogin(email, password)
  cachedSuperuserToken = auth.token
  return auth.token
}

export async function pbAuthRefresh(token: string) {
  return pbRequest<{ token: string; record: { email?: string } }>('/api/collections/_superusers/auth-refresh', {
    method: 'POST',
    token,
  })
}

export type PBRecord = Record<string, any> & {
  id: string
  collectionId?: string
  collectionName?: string
  created?: string
  updated?: string
}

type PBList<T> = {
  items: T[]
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

export async function listRecords<T extends PBRecord>(
  collection: string,
  params: Record<string, string | number | boolean | undefined> = {},
  token?: string
) {
  const search = new URLSearchParams()
  search.set('perPage', String(params.perPage ?? 500))
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  return pbRequest<PBList<T>>(`/api/collections/${collection}/records?${search}`, { token })
}

export async function getRecord<T extends PBRecord>(collection: string, id: string, token?: string) {
  return pbRequest<T>(`/api/collections/${collection}/records/${id}`, { token })
}

export async function createRecord<T extends PBRecord>(collection: string, body: Record<string, any>, token: string) {
  return pbRequest<T>(`/api/collections/${collection}/records`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export async function createFormRecord<T extends PBRecord>(collection: string, body: FormData, token: string) {
  return pbRequest<T>(`/api/collections/${collection}/records`, {
    method: 'POST',
    token,
    body,
  })
}

export async function updateFormRecord<T extends PBRecord>(collection: string, id: string, body: FormData, token: string) {
  return pbRequest<T>(`/api/collections/${collection}/records/${id}`, {
    method: 'PATCH',
    token,
    body,
  })
}

export async function updateRecord<T extends PBRecord>(collection: string, id: string, body: Record<string, any>, token: string) {
  return pbRequest<T>(`/api/collections/${collection}/records/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export async function deleteRecord(collection: string, id: string, token: string) {
  return pbRequest<null>(`/api/collections/${collection}/records/${id}`, {
    method: 'DELETE',
    token,
  })
}

export function fileUrl(collection: string, record: PBRecord, field: string, fallbackField?: string) {
  const value = record[field]
  const filename = Array.isArray(value) ? value[0] : value
  if (filename) return `${pbPublicUrl()}/api/files/${collection}/${record.id}/${filename}`
  return fallbackField ? record[fallbackField] || '' : ''
}

export function asDate(value: string | undefined) {
  return value || new Date().toISOString()
}

export function toYmd(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString().split('T')[0]
}

export function parseToUTCNoon(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).toISOString()
}
