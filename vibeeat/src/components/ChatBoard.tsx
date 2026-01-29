'use client'

import { sendMessage } from '@/app/actions/chat'
import { useRef } from 'react'

type Message = {
  id: number
  content: string
  createdAt: Date
  user: {
    nickname: string | null
    avatar: string | null
  }
}

export default function ChatBoard({ 
  bureauId, 
  messages, 
  currentUser 
}: { 
  bureauId: number
  messages: Message[]
  currentUser: { nickname: string | null } | null
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="font-bold text-gray-900 mb-4">Discussion Board</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center text-sm">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg) => {
            const isMe = currentUser && msg.user.nickname === currentUser.nickname // Simplified check
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img 
                  src={msg.user.avatar || ''} 
                  className="w-8 h-8 rounded-full bg-gray-200"
                  alt={msg.user.nickname || 'User'}
                />
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  isMe ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800'
                }`}>
                  {!isMe && <p className="text-xs font-bold mb-1">{msg.user.nickname}</p>}
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {currentUser ? (
        <form 
          ref={formRef}
          action={async (formData) => {
            await sendMessage(formData)
            formRef.current?.reset()
          }} 
          className="flex gap-2"
        >
          <input type="hidden" name="bureauId" value={bureauId} />
          <input
            type="text"
            name="content"
            required
            placeholder="Type a message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 text-center">Join the party to chat!</p>
      )}
    </div>
  )
}
