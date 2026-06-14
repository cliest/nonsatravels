import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faPen,
  faTrash,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const EMPTY_FORM = { title: '', message: '', category: '', shortcut: '', isActive: true };

const CannedResponseManager = ({ onClose, onChange }) => {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/canned-responses');
      if (response.data.success) {
        setResponses(response.data.data);
      }
    } catch (_error) {
      toast.error('Failed to load quick replies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (response) => {
    setEditingId(response.id);
    setForm({
      title: response.title || '',
      message: response.message || '',
      category: response.category || '',
      shortcut: response.shortcut || '',
      isActive: response.isActive !== false,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/canned-responses/${editingId}`, form);
        toast.success('Quick reply updated');
      } else {
        await api.post('/canned-responses', form);
        toast.success('Quick reply created');
      }
      cancelForm();
      await loadResponses();
      if (onChange) onChange();
    } catch (_error) {
      toast.error('Failed to save quick reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quick reply?')) return;

    try {
      await api.delete(`/canned-responses/${id}`);
      toast.success('Quick reply deleted');
      await loadResponses();
      if (onChange) onChange();
    } catch (_error) {
      toast.error('Failed to delete quick reply');
    }
  };

  const handleToggleActive = async (response) => {
    try {
      await api.put(`/canned-responses/${response.id}`, {
        title: response.title,
        message: response.message,
        category: response.category,
        shortcut: response.shortcut,
        isActive: !response.isActive,
      });
      await loadResponses();
      if (onChange) onChange();
    } catch (_error) {
      toast.error('Failed to update quick reply');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faBolt} className="text-primary" />
            Manage Quick Replies
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">
                {editingId ? 'Edit Quick Reply' : 'New Quick Reply'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                    placeholder="e.g. Booking confirmation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category (optional)</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                    placeholder="e.g. Bookings"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm resize-none"
                  placeholder="The message that will be inserted"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Shortcut (optional)</label>
                  <input
                    type="text"
                    value={form.shortcut}
                    onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                    placeholder="e.g. /booking"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-primary focus:ring-primary/50"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:shadow-lg disabled:opacity-60 transition-all"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {!showForm && (
            <button
              onClick={startCreate}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:shadow-lg transition-all"
            >
              <FontAwesomeIcon icon={faPlus} />
              New Quick Reply
            </button>
          )}

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : responses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No quick replies yet</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {responses.map((response) => (
                <div key={response.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{response.title}</p>
                      {response.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {response.category}
                        </span>
                      )}
                      {response.shortcut && (
                        <span className="text-xs text-primary">{response.shortcut}</span>
                      )}
                      {!response.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{response.message}</p>
                    <p className="text-xs text-gray-400 mt-1">Used {response.usageCount || 0} times</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(response)}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {response.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(response)}
                      className="text-gray-400 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleDelete(response.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CannedResponseManager.propTypes = {
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

export default CannedResponseManager;
