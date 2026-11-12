import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = '/api/v1/items'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const loadItems = useCallback(async () => {
    try {
      setError('')
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to load tasks')
      }

      const data = await response.json()
      setItems(data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function addItem(event) {
    event.preventDefault()

    if (!name.trim()) return

    try {
      setSaving(true)
      setError('')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unable to create task')
      }

      setName('')
      setDescription('')
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(id, changes) {
    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unable to update task')
      }

      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteItem(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete task')
      }

      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEditing(item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditDescription(item.description)
  }

  async function saveEdit(id) {
    if (!editName.trim()) {
      setError('Task name cannot be empty')
      return
    }

    await updateItem(id, {
      name: editName.trim(),
      description: editDescription.trim(),
    })

    setEditingId(null)
  }

  const completedCount = items.filter((item) => item.completed).length
  const pendingCount = items.length - completedCount

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">DEVOPS PROJECT</p>
          <h1>Task Management</h1>
          <p className="subtitle">
            Organize your work and track your progress.
          </p>
        </div>
        <span className="connection">
          <span className="status-dot" />
          API Connected
        </span>
      </header>

      <section className="stats">
        <article className="stat-card">
          <span>Total Tasks</span>
          <strong>{items.length}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
        <article className="stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>Add a new task</h2>

        <form onSubmit={addItem} className="task-form">
          <label htmlFor="task-name">Task name</label>
          <input
            id="task-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter task name"
            maxLength={150}
            required
          />

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your task"
            rows={3}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Adding...' : '+ Add Task'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Your tasks</h2>
            <p>Manage your current work.</p>
          </div>
          <button className="refresh-button" onClick={loadItems}>
            Refresh
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="empty-message">Loading tasks...</p>
        ) : items.length === 0 ? (
          <p className="empty-message">No tasks yet. Add your first task!</p>
        ) : (
          <div className="task-list">
            {items.map((item) => (
              <article className="task-card" key={item.id}>
                {editingId === item.id ? (
                  <div className="edit-form">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      maxLength={150}
                      aria-label="Edit task name"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                      rows={2}
                      aria-label="Edit task description"
                    />
                    <div className="task-actions">
                      <button onClick={() => saveEdit(item.id)}>
                        Save
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-main">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(event) =>
                          updateItem(item.id, {
                            completed: event.target.checked,
                          })
                        }
                        aria-label={`Mark ${item.name} as completed`}
                      />
                      <div>
                        <h3 className={item.completed ? 'completed' : ''}>
                          {item.name}
                        </h3>
                        <p>{item.description || 'No description'}</p>
                        <span
                          className={
                            item.completed
                              ? 'task-status done'
                              : 'task-status pending'
                          }
                        >
                          {item.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="secondary-button"
                        onClick={() => startEditing(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        React + Express + PostgreSQL | DevOps Internship Project
      </footer>
    </main>
  )
}

export default App
