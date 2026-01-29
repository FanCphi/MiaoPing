'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const bureauId = parseInt(formData.get('bureauId') as string)
  const content = formData.get('content') as string

  if (!content || !content.trim()) return { error: 'Message cannot be empty' }

  // Check if user is part of the bureau (optional, but good for security)
  const order = await prisma.order.findFirst({
    where: { bureauId, userId: user.id }
  })
  if (!order) return { error: 'You must join the party to chat' }

  try {
    await prisma.message.create({
      data: {
        bureauId,
        userId: user.id,
        content
      }
    })
    revalidatePath(`/bureau/${bureauId}`)
    return { success: true }
  } catch (e) {
    return { error: 'Failed to send message' }
  }
}
