'use client'

import React, { useState } from 'react'
import { profileService } from '../../services/apiServices'
import { useAuth } from '../../hooks/useAuth'

const TestProfileAPI: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testGetProfile = async () => {
    if (!user?._id) {
      setError('No user ID available')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Testing profile API with user ID:', user._id)
      const profileData = await profileService.getProfileByUserId(user._id)
      setResult(profileData)
      console.log('Profile API test result:', profileData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile')
      console.error('Profile API test error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testUpdateProfile = async () => {
    if (!user?._id) {
      setError('No user ID available')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const updateData = {
        FullName: 'Test User Updated',
        MobileNumber: '1234567890',
        Country: 'Test Country'
      }
      
      console.log('Testing profile update API with user ID:', user._id)
      const updatedProfile = await profileService.updateProfile(user._id, updateData)
      setResult(updatedProfile)
      console.log('Profile update API test result:', updatedProfile)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      console.error('Profile update API test error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile API Test</h1>
          <p className="text-gray-600">Please login to test the profile API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile API Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Info</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?._id}</p>
            <p><strong>Name:</strong> {user?.FullName}</p>
            <p><strong>Email:</strong> {user?.Email}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="space-x-4 mb-6">
            <button
              onClick={testGetProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Get Profile'}
            </button>
            <button
              onClick={testUpdateProfile}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Update Profile'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">Result:</h3>
              <pre className="text-green-700 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Base URL:</strong> https://hygo-backend.onrender.com/api/V0</p>
            <p><strong>Get Profile:</strong> GET /{user?._id}</p>
            <p><strong>Update Profile:</strong> PUT /{user?._id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestProfileAPI
