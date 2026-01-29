'use client'

import { createBureau } from '@/app/actions/bureau'
import { useState } from 'react'
import Link from 'next/link'

type Restaurant = {
  id: number
  name: string
  mealSets: {
    id: number
    title: string
    price: number
    minPeople: number
    maxPeople: number
  }[]
}

export default function CreateBureauForm({ restaurants }: { restaurants: Restaurant[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    try {
      const result = await createBureau(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // Success redirects automatically
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal Set</label>
        <select 
          name="mealSetId" 
          required
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="">-- Choose a Menu --</option>
          {restaurants.map(rest => (
            <optgroup key={rest.id} label={rest.name}>
              {rest.mealSets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.title} - ¥{set.price}/p ({set.minPeople}-{set.maxPeople} ppl)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
        <input
          type="datetime-local"
          name="eventTime"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating Party...' : 'Create Party'}
        </button>
      </div>
      
      <div className="text-center">
         <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
      </div>
    </form>
  )
}
