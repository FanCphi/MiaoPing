'use client'

import { useState } from 'react'
import { completeBureau } from '@/app/actions/bureau'
import { submitReview } from '@/app/actions/review'

type User = {
  id: number
  nickname: string | null
  avatar: string | null
}

type Review = {
  targetUserId: number
}

type Props = {
  bureauId: number
  status: string
  hostId: number
  currentUserId: number
  participants: User[]
  reviewsGiven: Review[]
}

const TAG_OPTIONS = ['Humorous', 'Punctual', 'Knowledgeable', 'Friendly', 'Generous', 'Quiet']

export default function BureauActionPanel({ bureauId, status, hostId, currentUserId, participants, reviewsGiven }: Props) {
  const [loading, setLoading] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')

  const isHost = hostId === currentUserId
  const isCompleted = status === 'COMPLETED'
  const reviewedUserIds = new Set(reviewsGiven.map(r => r.targetUserId))

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to mark this bureau as completed? This will enable reviews.')) return
    setLoading(true)
    await completeBureau(bureauId)
    setLoading(false)
  }

  const openReview = (user: User) => {
    setSelectedUser(user)
    setTags([])
    setComment('')
    setReviewModalOpen(true)
  }

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter(t => t !== tag))
    else setTags([...tags, tag])
  }

  const submitReviewForm = async () => {
    if (!selectedUser) return
    setLoading(true)
    await submitReview(bureauId, selectedUser.id, tags, comment)
    setLoading(false)
    setReviewModalOpen(false)
    setSelectedUser(null)
  }

  if (!isCompleted) {
    if (isHost) {
      return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Host Actions</h3>
          <p className="text-gray-600 mb-4 text-sm">Once the meal is done, mark it as completed to unlock reviews and Vibe Score updates.</p>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete Bureau & Unlock Reviews'}
          </button>
        </div>
      )
    }
    return null
  }

  // Completed State - Show Review List
  const targets = participants.filter(p => p.id !== currentUserId)
  
  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border-2 border-green-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews & Social Impressions</h3>
      <p className="text-gray-600 mb-4 text-sm">The event is completed! Review your meal partners to boost their Vibe Score.</p>
      
      <div className="space-y-4">
        {targets.map(user => {
          const isReviewed = reviewedUserIds.has(user.id)
          return (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={user.avatar || ''} className="w-10 h-10 rounded-full" />
                <span className="font-medium">{user.nickname}</span>
              </div>
              {isReviewed ? (
                <span className="text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">Reviewed ✓</span>
              ) : (
                <button
                  onClick={() => openReview(user)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full hover:bg-indigo-200"
                >
                  Review
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">Review {selectedUser.nickname}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Impressions</label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      tags.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                className="w-full border rounded-md p-2"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was the vibe?"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setReviewModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button 
                onClick={submitReviewForm} 
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review (+2 Vibe)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
