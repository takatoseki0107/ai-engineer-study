import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register(username, password)
      navigate('/')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string } | undefined
        setError(data?.error ?? '登録に失敗しました')
      } else {
        setError('登録に失敗しました')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6">新規登録</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-username" className="block text-xs font-medium text-gray-600 mb-1">
              ユーザー名 <span className="text-gray-400">（3〜50文字）</span>
            </label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs font-medium text-gray-600 mb-1">
              パスワード <span className="text-gray-400">（6文字以上）</span>
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
