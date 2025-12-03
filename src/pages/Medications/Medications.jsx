import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { medicationService } from '../../services/supabaseService'
import { getMedicationsMaster, getMedicationCategories } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './Medications.css'

const Medications = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  
  const [medications, setMedications] = useState([])
  const [medicationsMaster, setMedicationsMaster] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Prescription Medications (Hormonal)')
  const [dateLogs, setDateLogs] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [selectedMasterMed, setSelectedMasterMed] = useState('')
  const [useCustomName, setUseCustomName] = useState(false)
  const [newMedCategory, setNewMedCategory] = useState('Prescription Medications (Hormonal)')
  const [newMedType, setNewMedType] = useState('medication')
  const [newMedSchedule, setNewMedSchedule] = useState({ time: '08:00', frequency: 'daily' })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Reload logs when date changes
    const loadDateLogs = async () => {
      if (!user) return
      try {
        const { data: logs } = await supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate)
        setDateLogs(logs || [])
      } catch (err) {
        console.error('Error loading date logs:', err)
      }
    }
    loadDateLogs()
  }, [selectedDate, user])

  useEffect(() => {
    // Reload medications when category changes
    const loadMedsByCategory = async () => {
      if (!user) return
      try {
        const { data } = await getMedicationsMaster(selectedCategory)
        setMedicationsMaster(data || [])
      } catch (err) {
        console.error('Error loading medications by category:', err)
      }
    }
    loadMedsByCategory()
  }, [selectedCategory, user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load user's medications
      const { data: meds, error: medsError } = await medicationService.getAll(user.id)
      if (medsError) throw medsError
      setMedications(meds || [])

      // Load categories and medications
      const [catsData, medsMaster] = await Promise.all([
        getMedicationCategories(),
        getMedicationsMaster(selectedCategory),
      ])
      setCategories(catsData.data || [])
      setMedicationsMaster(medsMaster.data || [])

      // Load selected date's medication logs
      const { data: logs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
      
      setDateLogs(logs || [])
    } catch (err) {
      console.error('Error loading medications:', err)
      setError(err.message || 'Failed to load medications')
    } finally {
      setLoading(false)
    }
  }

  const toggleMedication = async (medicationId) => {
    if (!user) return

    const isTaken = dateLogs.some(log => log.medication_id === medicationId)

    try {
      if (isTaken) {
        // Remove log
        const logToDelete = dateLogs.find(log => log.medication_id === medicationId)
        if (logToDelete) {
          const { error } = await supabase
            .from('medication_logs')
            .delete()
            .eq('id', logToDelete.id)
          if (error) throw error
        }
      } else {
        // Add log
        const { error } = await medicationService.logDose(medicationId, {
          user_id: user.id,
          date: selectedDate,
        })
        if (error) throw error
      }
      
      // Reload date's logs
      const { data: logs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
      setDateLogs(logs || [])
    } catch (err) {
      console.error('Error toggling medication:', err)
      setError(err.message || 'Failed to update medication log')
    }
  }

  const handleAddMedication = async (e) => {
    e.preventDefault()
    if (!user) return

    const medName = useCustomName ? newMedName.trim() : selectedMasterMed
    if (!medName) {
      setError('Please select a medication or enter a custom name')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      // Get category from master med if selected, otherwise use selected category
      const masterMed = medicationsMaster.find(m => m.name === medName)
      const medCategory = masterMed?.category || selectedCategory
      
      const medData = {
        user_id: user.id,
        name: medName,
        type: newMedType,
        category: medCategory,
        schedule: newMedSchedule,
      }

      const result = await medicationService.create(medData)
      if (result.error) throw result.error

      setSuccess(true)
      setShowAddModal(false)
      setNewMedName('')
      setSelectedMasterMed('')
      setUseCustomName(false)
      setNewMedCategory(selectedCategory)
      setNewMedSchedule({ time: '08:00', frequency: 'daily' })
      setTimeout(() => setSuccess(false), 2000)
      
      // Reload medications
      const { data: meds } = await medicationService.getAll(user.id)
      setMedications(meds || [])
    } catch (err) {
      setError(err.message || 'Failed to add medication')
    } finally {
      setSaving(false)
    }
  }

  const handleMasterMedSelect = (medName) => {
    setSelectedMasterMed(medName)
    setUseCustomName(false)
    setNewMedName('')
    
    // Auto-fill type based on master data if available
    const masterMed = medicationsMaster.find(m => m.name === medName)
    if (masterMed) {
      if (masterMed.type?.toLowerCase().includes('hormone')) {
        setNewMedType('medication')
      } else if (masterMed.type?.toLowerCase().includes('supplement') || masterMed.type?.toLowerCase().includes('vitamin')) {
        setNewMedType('supplement')
      }
    }
  }

  const getScheduleDisplay = (schedule) => {
    if (!schedule) return 'Not set'
    if (typeof schedule === 'string') {
      try {
        schedule = JSON.parse(schedule)
      } catch {
        return schedule
      }
    }
    return `${schedule.time || 'Not set'} • ${schedule.frequency || 'Daily'}`
  }

  const isMedicationTaken = (medicationId) => {
    return dateLogs.some(log => log.medication_id === medicationId)
  }

  if (loading) {
    return (
      <div className="medications">
        <div className="page-title">Medications/Supplements</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="medications">
      <div className="page-title">Medications/Supplements</div>
      
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <Card>
        <div className="card-title">Add Medication/Supplement</div>
        <div className="form-group">
          <label>Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <Button
            type="button"
            variant="teal"
            onClick={() => {
              setNewMedCategory(selectedCategory)
              setShowAddModal(true)
            }}
            style={{ flex: 1, padding: '12px', fontSize: '14px' }}
          >
            Add from {selectedCategory}
          </Button>
        </div>

        <div className="card-title">Schedule for {formatDate(selectedDate)}</div>
        <div className="card-subtitle">Track your medications & supplements</div>

        <div className="med-list">
          {medications.length === 0 ? (
            <div className="empty-state">No medications added yet. Click "Add Medication" to get started.</div>
          ) : (
            medications.map((med) => (
              <div key={med.id} className="med-item">
                <div className="med-info">
                  <div className="med-name">{med.name}</div>
                  <div className="med-time">{getScheduleDisplay(med.schedule)}</div>
                </div>
                <div
                  className={`checkbox ${isMedicationTaken(med.id) ? 'checked' : ''}`}
                  onClick={() => toggleMedication(med.id)}
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Medication/Supplement</h3>
            <form onSubmit={handleAddMedication}>
              <div className="form-group">
                <label>Category: {newMedCategory}</label>
              </div>
              <div className="form-group">
                <label>Select from {newMedCategory}</label>
                <select
                  className="form-select"
                  value={selectedMasterMed}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMasterMedSelect(e.target.value)
                    } else {
                      setSelectedMasterMed('')
                    }
                  }}
                  disabled={useCustomName}
                >
                  <option value="">Choose from list...</option>
                  {medicationsMaster.map((med) => (
                    <option key={med.id} value={med.name}>
                      {med.name} {med.typical_dose ? `(${med.typical_dose})` : ''}
                    </option>
                  ))}
                </select>
                {selectedMasterMed && (
                  <div className="med-info-hint" style={{ marginTop: '8px', padding: '8px', background: 'var(--purple-light)', borderRadius: '8px', fontSize: '12px' }}>
                    {medicationsMaster.find(m => m.name === selectedMasterMed)?.purpose && (
                      <div><strong>Purpose:</strong> {medicationsMaster.find(m => m.name === selectedMasterMed).purpose}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ textAlign: 'center', margin: '12px 0' }}>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>OR</span>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={useCustomName}
                    onChange={(e) => {
                      setUseCustomName(e.target.checked)
                      if (e.target.checked) {
                        setSelectedMasterMed('')
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  Enter Custom Name
                </label>
                {useCustomName && (
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="e.g., Custom Medication Name"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  className="form-select"
                  value={newMedType}
                  onChange={(e) => setNewMedType(e.target.value)}
                >
                  <option value="medication">Medication</option>
                  <option value="supplement">Supplement</option>
                  <option value="therapy">Therapy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={newMedSchedule.time}
                  onChange={(e) => setNewMedSchedule({ ...newMedSchedule, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Frequency</label>
                <select
                  className="form-select"
                  value={newMedSchedule.frequency}
                  onChange={(e) => setNewMedSchedule({ ...newMedSchedule, frequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">Medication added! ✅</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="card-title">Adherence Streak</div>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '56px', fontWeight: 700, color: 'var(--purple)' }}>
            {medications.filter(med => isMedicationTaken(med.id)).length}
          </div>
          <div style={{ fontSize: '16px', color: 'var(--muted)', marginTop: '8px' }}>
            Taken today
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#555' }}>
            Keep it up! Consistency is key.
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Medications
