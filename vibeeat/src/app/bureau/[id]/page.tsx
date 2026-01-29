import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'
import Link from 'next/link'
import JoinButton from '@/components/JoinButton'

import ChatBoard from '@/components/ChatBoard'
import CancelButton from '@/components/CancelButton'
import BureauActionPanel from '@/components/BureauActionPanel'

export default async function BureauDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  // ...
  const bureauId = parseInt(resolvedParams.id)
  
  if (isNaN(bureauId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid Bureau ID</h1>
          <Link href="/" className="text-indigo-600">Back to Home</Link>
        </div>
      </div>
    )
  }
  
  // bureau fetch logic
  
  const user = await getCurrentUser()
  const bureau = await prisma.bureau.findUnique({
    where: { id: bureauId },
    include: {
      host: true,
      mealSet: {
        include: { restaurant: true }
      },
      orders: {
        include: { user: true }
      },
      messages: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      },
      reviews: {
        where: { reviewerId: user?.id || -1 },
        select: { targetUserId: true }
      }
    }
  })

  if (!bureau) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Party not found or canceled</h1>
          <p className="text-gray-600">The dining party might have been removed.</p>
          <Link href="/" className="text-indigo-600">Back to Home</Link>
        </div>
      </div>
    )
  }

  const isJoined = user ? bureau.orders.some(o => o.userId === user.id && o.status === 'PAID') : false
  const userOrder = user ? bureau.orders.find(o => o.userId === user.id && o.status === 'PAID') : null
  
  // ...

  const paidOrders = bureau.orders.filter(o => o.status === 'PAID')
  const spotsLeft = bureau.mealSet.maxPeople - paidOrders.length
  const participants = bureau.orders.map(o => o.user)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       {/* Image Header */}
       <div className="relative h-64 md:h-80">
         <img 
           src={bureau.mealSet.restaurant.image || ''} 
           className="w-full h-full object-cover"
         />
         <Link href="/" className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow hover:bg-white">
           ← Back
         </Link>
       </div>

       <div className="max-w-3xl mx-auto -mt-10 relative px-4">
         <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            
            {/* Title & Price */}
            <div className="flex justify-between items-start">
               <div>
                 <h1 className="text-2xl font-bold text-gray-900">{bureau.mealSet.restaurant.name}</h1>
                 <p className="text-lg text-gray-600">{bureau.mealSet.title}</p>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold text-indigo-600">¥{bureau.mealSet.price}</p>
                 <p className="text-sm text-gray-500">per person</p>
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
               <div>
                 <p className="text-sm text-gray-500">Time</p>
                 <p className="font-medium">{new Date(bureau.eventTime).toLocaleString()}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-500">Location</p>
                 <p className="font-medium">{bureau.mealSet.restaurant.location}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-500">People</p>
                 <p className="font-medium">{paidOrders.length} / {bureau.mealSet.maxPeople} joined</p>
               </div>
               <div>
                 <p className="text-sm text-gray-500">Host</p>
                 <div className="flex items-center gap-2">
                    <span className="font-medium">{bureau.host.nickname}</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1 rounded">Vibe {bureau.host.vibeScore}</span>
                 </div>
               </div>
            </div>

            {/* Menu Details */}
            {bureau.mealSet.menuDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Menu Highlights</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{bureau.mealSet.menuDetails}</p>
              </div>
            )}

            {/* Participants */}
            <div>
              <h3 className="font-medium mb-3">Participants ({paidOrders.length})</h3>
              <div className="flex -space-x-2 overflow-hidden">
                {participants.map((p, i) => (
                   <div key={p.id} className="relative group">
                     {p.avatar ? (
                       <img src={p.avatar} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                     ) : (
                       <div className="h-10 w-10 rounded-full bg-indigo-100 ring-2 ring-white flex items-center justify-center text-indigo-600 font-bold text-xs">
                         {p.nickname?.charAt(0)}
                       </div>
                     )}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                        {p.nickname}
                     </div>
                   </div>
                ))}
                {spotsLeft > 0 && (
                  <div className="h-10 w-10 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-gray-400 text-xs font-medium">
                    +{spotsLeft}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
               <JoinButton 
                 bureauId={bureau.id} 
                 price={bureau.mealSet.price}
                 isJoined={isJoined}
                 isFull={spotsLeft <= 0}
               />
               {isJoined && userOrder && (
                 <CancelButton orderId={userOrder.id} />
               )}
            </div>

            {/* Chat Board (only for joined members) */}
            {isJoined && user && (
                <div className="space-y-4 mt-6">
                   <ChatBoard bureauId={bureauId} messages={bureau.messages} currentUser={user} />
                   
                   <BureauActionPanel 
                      bureauId={bureau.id}
                      status={bureau.status}
                      hostId={bureau.hostId}
                      currentUserId={user.id} 
                      participants={participants}
                      reviewsGiven={bureau.reviews}
                   />
                </div>
            )}

         </div>
       </div>
    </div>
  )
}
