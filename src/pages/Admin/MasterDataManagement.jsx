import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const MasterDataManagement = () => {
  const [activeTab, setActiveTab] = useState('symptoms')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const tables = {
    symptoms: { table: 'symptoms_master', nameField: 'symptom', hasCategory: true },
    medications: { table: 'medications_master', nameField: 'name', hasCategory: false },
    exercises: { table: 'exercises_master', nameField: 'name', hasCategory: true },
    foods: { table: 'food_items', nameField: 'name', hasCategory: true },
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const config = tables[activeTab]
      const { data: items, error } = await supabase
        .from(config.table)
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setData(items || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newItem.trim()) {
      alert('Please enter a name')
      return
    }

    try {
      const config = tables[activeTab]
      const insertData = {
        [config.nameField]: newItem.trim(),
      }

      if (config.hasCategory && newCategory.trim()) {
        insertData.category = newCategory.trim()
      }

      const { error } = await supabase
        .from(config.table)
        .insert([insertData])

      if (error) throw error

      setNewItem('')
      setNewCategory('')
      loadData()
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const config = tables[activeTab]
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item: ' + error.message)
    }
  }

  const config = tables[activeTab]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Master Data Management</h1>
        <p>Manage symptoms, medications, exercises, and food items</p>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
          {Object.keys(tables).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab ? '2px solid #667eea' : 'none',
                marginBottom: '-2px',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#667eea' : '#6b7280',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Add New {activeTab.slice(0, -1)}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={`Enter ${config.nameField}...`}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            {config.hasCategory && (
              <input
                type="text"
                placeholder="Category (optional)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
            )}
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ whiteSpace: 'nowrap' }}
            >
              Add Item
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{config.nameField === 'symptom' ? 'Symptom' : 'Name'}</th>
                    {config.hasCategory && <th>Category</th>}
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item[config.nameField]}</td>
                      {config.hasCategory && <td>{item.category || '-'}</td>}
                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDelete(item.id)}
                          style={{ background: '#ef4444', color: 'white' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Total items: {data.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MasterDataManagement
