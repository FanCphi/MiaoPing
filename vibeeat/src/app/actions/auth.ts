'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const phone = formData.get('phone') as string
  
  if (!phone) {
    return { error: 'Phone number is required' }
  }

  // Find user
  let user = await prisma.user.findUnique({
    where: { phone },
  })

  // If not found, create one for MVP convenience (or return error)
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        nickname: `User${phone.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
      },
    })
  }

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('userId', user.id.toString(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/login')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  })

  return user
}
