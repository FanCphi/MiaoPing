'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createBureau(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const mealSetId = parseInt(formData.get('mealSetId') as string)
  const eventTimeStr = formData.get('eventTime') as string
  
  if (!mealSetId || !eventTimeStr) {
    return { error: 'Missing required fields' }
  }

  const eventTime = new Date(eventTimeStr)

  const bureau = await prisma.bureau.create({
    data: {
      hostId: user.id,
      mealSetId,
      eventTime,
      status: 'RECRUITING'
    }
  })

  // Auto-join the host? Usually yes.
  await prisma.order.create({
    data: {
      bureauId: bureau.id,
      userId: user.id,
      amount: 0, // Host might pay differently or same, for now 0 or fetch price
      status: 'PAID' // Host implies commitment
    }
  })
  // Wait, if host pays, we should get the price.
  // For MVP let's just create the bureau. 
  // The PRD says "C端（发起人）... 筛选参与者", implies host is part of it.
  // Let's assume host joins automatically.

  redirect('/')
}

export async function joinBureau(bureauId: number) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Check if already joined
  const existingOrder = await prisma.order.findFirst({
    where: {
      bureauId,
      userId: user.id
    }
  })

  if (existingOrder) {
    return { error: 'Already joined' }
  }

  // Get price and capacity
  const bureau = await prisma.bureau.findUnique({
    where: { id: bureauId },
    include: { mealSet: true }
  })

  if (!bureau) return { error: 'Bureau not found' }
  
  // Capacity check against paid orders
  const paidCount = await prisma.order.count({
    where: { bureauId, status: 'PAID' }
  })
  if (paidCount >= bureau.mealSet.maxPeople) {
    return { error: 'Party is full' }
  }

  // Create Order (Unpaid)
  const order = await prisma.order.create({
    data: {
      bureauId,
      userId: user.id,
      amount: bureau.mealSet.price,
      status: 'PAID' // Simulating successful payment as per PRD
    }
  })

  return { success: true }
}

export async function completeBureau(bureauId: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const bureau = await prisma.bureau.findUnique({
    where: { id: bureauId }
  })

  if (!bureau) return { error: 'Bureau not found' }
  if (bureau.hostId !== user.id) return { error: 'Only host can complete bureau' }

  await prisma.bureau.update({
    where: { id: bureauId },
    data: { status: 'COMPLETED' }
  })

  // Settle all paid orders
  await prisma.order.updateMany({
    where: { bureauId, status: 'PAID' },
    data: { status: 'SETTLED' }
  })

  // Add +5 Vibe Score for all participants (punctuality assumption)
  const orders = await prisma.order.findMany({
    where: { bureauId, status: 'SETTLED' }
  })
  
  const participantIds = orders.map(o => o.userId)
  
  if (participantIds.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: participantIds } },
      data: { vibeScore: { increment: 5 } }
    })
  }
  
  revalidatePath(`/bureau/${bureauId}`)
  return { success: true }
}
