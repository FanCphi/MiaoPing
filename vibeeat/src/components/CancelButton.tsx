'use client'

import { cancelOrder } from '@/app/actions/order'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel? Refund policy applies.')) return

    setLoading(true)
    try {
      const result = await cancelOrder(orderId)
      if (result?.error) {
        alert(result.error)
      } else {
        alert(result.message || 'Cancelled successfully')
        router.refresh()
      }
    } catch {
      alert('Failed to cancel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="w-full mt-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Cancel Order & Refund'}
    </button>
  )
}
