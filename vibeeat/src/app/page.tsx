import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getCurrentUser } from './actions/auth'

export default async function Home() {
  const user = await getCurrentUser()
  const bureaus = await prisma.bureau.findMany({
    where: { status: 'RECRUITING' },
    include: {
      host: true,
      mealSet: {
        include: { restaurant: true }
      },
      orders: true // To count participants
    },
    orderBy: { eventTime: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">VibeEat</h1>
          {user ? (
             <div className="flex items-center gap-4">
               <a href="/admin/mealsets" className="text-sm text-indigo-600 hover:text-indigo-800">Admin</a>
               <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt={user.nickname || 'User'} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {user.nickname?.charAt(0) || 'U'}
                    </div>
                  )}
                 <span className="text-sm font-medium text-gray-700">{user.nickname}</span>
               </Link>
             </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-indigo-600">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {bureaus.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No active dining parties found.</p>
            <p className="text-gray-400 text-sm">Be the first to host one!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bureaus.map(bureau => (
              <Link key={bureau.id} href={`/bureau/${bureau.id}`}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-48 bg-gray-200 relative">
                     {/* Image placeholder or restaurant image */}
                     <img 
                       src={bureau.mealSet.restaurant.image || 'https://via.placeholder.com/400'} 
                       alt={bureau.mealSet.restaurant.name}
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{bureau.mealSet.restaurant.name}</h3>
                        <p className="text-white/90 text-sm">{bureau.mealSet.title}</p>
                     </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <img src={bureau.host.avatar || ''} className="w-8 h-8 rounded-full bg-gray-100" alt={bureau.host.nickname || 'Host'} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bureau.host.nickname}</p>
                          <p className="text-xs text-gray-500">{bureau.host.school || bureau.host.company || 'Host'}</p>
                        </div>
                      </div>
                      {(bureau as any).relevanceScore !== undefined && (bureau as any).relevanceScore > 0 && (
                        <span className="bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded-full font-bold">
                          {(bureau as any).relevanceScore > 50 ? '🔥 High Match' : '✨ Recommended'}
                        </span>
                      )}
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                         ¥{bureau.mealSet.price}/person
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                       <div className="flex items-center gap-2">
                         <span>📅</span>
                         <span>{new Date(bureau.eventTime).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span>👥</span>
                         <span>{bureau.orders.length} / {bureau.mealSet.maxPeople} joined</span>
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link 
        href="/create"
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}
