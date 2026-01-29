'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function cancelOrder(orderId: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { bureau: true }
  })

  if (!order) return { error: 'Order not found' }
  if (order.userId !== user.id) return { error: 'Not authorized' }
  if (order.status !== 'PAID') return { error: 'Order not paid or already cancelled' }

  const eventTime = new Date(order.bureau.eventTime)
  const now = new Date()
  const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  let refundAmount = 0
  let refundStatus = 'DENIED'

  if (hoursUntilEvent >= 24) {
    refundAmount = order.amount
    refundStatus = 'COMPLETED'
  } else if (hoursUntilEvent >= 3) {
    refundAmount = order.amount * 0.5
    refundStatus = 'COMPLETED'
  } else {
    refundAmount = 0
    refundStatus = 'DENIED'
  }

  // Update order status
  const updateData: any = {
    status: 'CANCELLED',
    cancelledAt: now,
    refundAmount,
    refundStatus,
  }
  await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  })

  // If refundAmount > 0, we should technically call a payment gateway refund API here.
  // For MVP/Demo, we just record it.

  revalidatePath(`/bureau/${order.bureauId}`)
  revalidatePath('/profile')
  
  return { 
    success: true, 
    refundAmount, 
    message: refundAmount > 0 
      ? `Refund of ¥${refundAmount} processed.` 
      : 'No refund available (<3h before event).' 
  }
}
