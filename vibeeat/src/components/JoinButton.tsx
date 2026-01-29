'use client'

import { joinBureau } from '@/app/actions/bureau'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinButton({ bureauId, price, isJoined, isFull }: { bureauId: number, price: number, isJoined: boolean, isFull?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (isJoined) {
    return (
      <div className="space-y-2">
        <button disabled className="w-full bg-green-100 text-green-800 font-medium py-3 rounded-lg cursor-default">
          ✓ You have joined
        </button>
        {/* We can add a cancel button here, but it's better to pass it as a prop or handle it in a separate component. 
            However, for simplicity in this MVP, let's create a separate CancelButton component or handle it here if passed.
            Since the user asked to "add cancel button to detail page", I will modify the BureauDetail page to pass down a way to cancel, 
            or add a server action call here.
        */}
      </div>
    )
  }

  if (isFull) {
    return (
      <button disabled className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-lg cursor-default">
        Full • No spots left
      </button>
    )
  }

  const handleJoin = async () => {
    if (!confirm(`Confirm payment of ¥${price} to join?`)) return
    
    setLoading(true)
    try {
      const result = await joinBureau(bureauId)
      if (result?.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    } catch {
      alert('Failed to join')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
    >
      {loading ? 'Processing...' : `Pay ¥${price} to Join`}
    </button>
  )
}
