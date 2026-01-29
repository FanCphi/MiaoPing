
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type BureauWithDetails = {
  id: number
  eventTime: Date
  mealSet: {
    title: string
    price: number
    restaurant: {
      name: string
      image: string | null
    }
  }
  host: {
    id: number
    nickname: string | null
    school: string | null
    company: string | null
    interests: string | null // JSON string
  }
  orders: any[]
}

type UserProfile = {
  id: number
  interests: string[]
  school: string | null
  company: string | null
}

export function calculateRelevanceScore(bureau: BureauWithDetails, user: UserProfile): number {
  let score = 0

  // 1. Time Relevance (closer is better, but not passed)
  const now = new Date()
  if (bureau.eventTime < now) return -1 // Filter out past events
  
  // 2. Social Connection (School/Company)
  if (user.school && bureau.host.school === user.school) score += 30
  if (user.company && bureau.host.company === user.company) score += 30

  // 3. Interest Match
  try {
    const hostInterests = bureau.host.interests ? JSON.parse(bureau.host.interests) : []
    const commonInterests = hostInterests.filter((i: string) => user.interests.includes(i))
    score += commonInterests.length * 10
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 4. Fill Rate (prefer bureaus that are filling up but not full)
  // Simple heuristic: existing orders give social proof
  score += bureau.orders.length * 5

  return score
}

export async function getRecommendedBureaus(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return []

  const bureaus = await prisma.bureau.findMany({
    where: { 
      status: 'RECRUITING',
      eventTime: { gt: new Date() }
    },
    include: {
      host: true,
      mealSet: {
        include: { restaurant: true }
      },
      orders: true
    }
  })

  const userProfile: UserProfile = {
    id: user.id,
    school: user.school,
    company: user.company,
    interests: user.interests ? JSON.parse(user.interests) : []
  }

  // Calculate scores and sort
  const scoredBureaus = bureaus.map(b => ({
    ...b,
    relevanceScore: calculateRelevanceScore(b as any, userProfile)
  }))

  return scoredBureaus.sort((a, b) => b.relevanceScore - a.relevanceScore)
}
