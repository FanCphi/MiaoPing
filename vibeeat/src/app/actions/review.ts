'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function submitReview(bureauId: number, targetUserId: number, tags: string[], comment: string) {
  const reviewer = await getCurrentUser()
  if (!reviewer) return { error: 'Not authenticated' }

  try {
    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: {
        bureauId,
        reviewerId: reviewer.id,
        targetUserId
      }
    })

    if (existing) {
      return { error: 'You have already reviewed this user for this bureau' }
    }

    // 1. Create Review
    await prisma.review.create({
      data: {
        bureauId,
        reviewerId: reviewer.id,
        targetUserId,
        tags: JSON.stringify(tags),
        comment
      }
    })

    // 2. Update Vibe Score (+2 for receiving a review)
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        vibeScore: { increment: 2 }
      }
    })

    revalidatePath(`/bureau/${bureauId}`)
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to submit review' }
  }
}
