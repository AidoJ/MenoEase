import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SymptomsTracker from '../SymptomsTracker/SymptomsTracker'
import MoodWellness from '../MoodWellness/MoodWellness'
import BowelTracker from '../BowelTracker/BowelTracker'
import './Track.css'

const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'symptoms')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams, { replace: true })
  }

  return (
    <div className="track-page">
      <div className="track-tabs">
        <button
          className={`track-tab ${activeTab === 'symptoms' ? 'active' : ''}`}
          onClick={() => handleTabChange('symptoms')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Symptoms</span>
        </button>
        <button
          className={`track-tab ${activeTab === 'mood' ? 'active' : ''}`}
          onClick={() => handleTabChange('mood')}
        >
          <span className="tab-icon">💆</span>
          <span className="tab-label">Energy/Mood</span>
        </button>
        <button
          className={`track-tab ${activeTab === 'bowel' ? 'active' : ''}`}
          onClick={() => handleTabChange('bowel')}
        >
          <span className="tab-icon">🚽</span>
          <span className="tab-label">Stool</span>
        </button>
      </div>

      <div className="track-content">
        {activeTab === 'symptoms' && <SymptomsTracker />}
        {activeTab === 'mood' && <MoodWellness />}
        {activeTab === 'bowel' && <BowelTracker />}
      </div>
    </div>
  )
}

export default Track






