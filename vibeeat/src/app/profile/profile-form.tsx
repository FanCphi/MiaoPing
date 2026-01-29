'use client'

import { updateProfile } from '@/app/actions/profile'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = {
  nickname: string | null
  school: string | null
  company: string | null
  bio: string | null
  photos: string | null
  interests: string | null
  vibeScore: number
}

const INTEREST_OPTIONS = ['Foodie', 'Travel', 'Tech', 'Music', 'Sports', 'Movies', 'Reading', 'Art', 'Fashion', 'Gaming']

export default function ProfileForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  // Parse initial state safely
  let initialPhotos: string[] = []
  try {
    initialPhotos = user.photos ? JSON.parse(user.photos) : []
  } catch (e) {
    console.error('Failed to parse photos', e)
  }

  let initialInterests: string[] = []
  try {
    initialInterests = user.interests ? JSON.parse(user.interests) : []
  } catch (e) {
    console.error('Failed to parse interests', e)
  }

  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [interests, setInterests] = useState<string[]>(initialInterests)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')

  const addPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()])
      setNewPhotoUrl('')
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    // Append complex fields
    formData.set('photos', JSON.stringify(photos))
    formData.set('interests', JSON.stringify(interests))
    
    try {
      const result = await updateProfile(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Vibe Score Display */}
      <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between border border-indigo-100">
        <div>
          <h3 className="text-lg font-medium text-indigo-900">Vibe Score</h3>
          <p className="text-sm text-indigo-700">Your social reputation score</p>
        </div>
        <div className="text-3xl font-bold text-indigo-600">{user.vibeScore}</div>
      </div>
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Basic Info</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nickname</label>
          <input
            type="text"
            name="nickname"
            defaultValue={user.nickname || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">School</label>
          <input
            type="text"
            name="school"
            defaultValue={user.school || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            defaultValue={user.company || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user.bio || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          />
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                interests.includes(interest)
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Photos</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((url, idx) => (
            <div key={idx} className="relative aspect-w-1 aspect-h-1 group">
              <img src={url} alt={`User photo ${idx + 1}`} className="object-cover rounded-lg w-full h-32 bg-gray-100" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="Enter image URL..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          />
          <button
            type="button"
            onClick={addPhoto}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
         <Link href="/" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Cancel</Link>
         <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
