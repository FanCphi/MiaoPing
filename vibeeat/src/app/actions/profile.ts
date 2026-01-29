'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const nickname = formData.get('nickname') as string
  const school = formData.get('school') as string
  const company = formData.get('company') as string
  const bio = formData.get('bio') as string
  const photos = formData.get('photos') as string
  const interests = formData.get('interests') as string

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname,
        school,
        company,
        bio,
        photos,
        interests
      }
    })
    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    return { error: 'Failed to update profile' }
  }
}
