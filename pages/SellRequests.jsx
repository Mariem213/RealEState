import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { useLanguage } from '../context/LanguageContext'
import AdminLayout from '../components/AdminLayout'
import '../styles/Dashboard.css'

const SELL_REQUESTS_LOCAL_KEY = 'sellRequestsLocal'

function formatCreatedAt(value, locale) {
  if (!value) return '-'
  if (value?.toDate) {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(value.toDate())
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function RequestDetail({ label, value }) {
  return (
    <div className="admin-modal__item">
      <p className="admin-modal__label">{label}</p>
      <p className="admin-modal__value">{value || '-'}</p>
    </div>
  )
}

function safeFileName(value, fallback) {
  return (value || fallback).trim().replace(/[\\/:*?"<>|]/g, '-')
}

function readLocalSellRequests() {
  try {
    const raw = localStorage.getItem(SELL_REQUESTS_LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalSellRequests(requests) {
  localStorage.setItem(SELL_REQUESTS_LOCAL_KEY, JSON.stringify(requests))
}

export default function SellRequests() {
  const { locale, t } = useLanguage()
  const [requests, setRequests] = useState([])
  const loading = false
  const error = ''
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    const syncLocal = () => {
      const localRequests = readLocalSellRequests()
      const sorted = [...localRequests].sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime()
        const second = new Date(b.createdAt || 0).getTime()
        return second - first
      })
      setRequests(sorted)
    }
    syncLocal()
    const handleStorage = () => syncLocal()
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  async function handleDelete(request) {
    const confirmed = window.confirm(`Delete request for ${request.propertyTitle || 'this property'}?`)
    if (!confirmed) return

    try {
      setDeletingId(request.id)
      const updated = readLocalSellRequests().filter((item) => item.id !== request.id)
      saveLocalSellRequests(updated)
      setRequests(updated)
    } catch {
      window.alert('Unable to delete this request right now. Please try again later.')
    } finally {
      setDeletingId('')
    }
  }

  function buildRecordLines(request, localeValue) {
    return [
      `Property title: ${request.propertyTitle || '-'}`,
      `Property type: ${request.propertyType || '-'}`,
      `Owner name: ${request.fullName || '-'}`,
      `Phone: ${request.phone || '-'}`,
      `Email: ${request.email || '-'}`,
      `Price: ${request.askingPrice || '-'}`,
      `Location: ${request.location || '-'}`,
      `Submitted: ${formatCreatedAt(request.createdAt, localeValue)}`,
    ]
  }

  function handleDownloadOne(request) {
    const doc = new jsPDF()
    const lines = [
      'Sell Request',
      `Generated at: ${new Date().toLocaleString()}`,
      '',
      ...buildRecordLines(request, locale),
    ]
    doc.setFontSize(12)
    doc.text(lines, 14, 18, { maxWidth: 182, lineHeightFactor: 1.4 })
    doc.save(`${safeFileName(request.propertyTitle, 'sell-request')}.pdf`)
  }

  function handleDownloadAll() {
    if (requests.length === 0) return

    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = 14
    const marginTop = 18
    const marginBottom = 18
    const lineHeight = 7
    let y = marginTop

    const writeLine = (text = '') => {
      if (y > pageHeight - marginBottom) {
        doc.addPage()
        y = marginTop
      }
      doc.text(text, marginX, y)
      y += lineHeight
    }

    doc.setFontSize(17)
    writeLine('Sell Request')
    doc.setFontSize(11)
    writeLine('Complete Export Report')
    writeLine(`Generated at: ${new Date().toLocaleString()}`)
    writeLine(`Total records: ${requests.length}`)
    writeLine('')

    requests.forEach((request, index) => {
      writeLine(`Record ${index + 1}`)
      buildRecordLines(request, locale).forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 182)
        wrapped.forEach((part) => writeLine(part))
      })
      writeLine('')
    })

    doc.save(`sell-requests-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <AdminLayout
      title={t('admin.sell.title')}
      subtitle={t('admin.sell.subtitle')}
      headerAction={
        !loading && !error && requests.length > 0 ? (
          <button
            type="button"
            onClick={handleDownloadAll}
            className="dashboard__btn dashboard__btn--download-all"
          >
            Download All
          </button>
        ) : null
      }
    >
      <section className="dashboard__card">
        {loading ? <p className="dashboard__subtitle">Loading sell requests...</p> : null}
        {error ? <p className="dashboard__subtitle" style={{ color: '#b91c1c' }}>{error}</p> : null}
        {!loading && !error && requests.length === 0 ? <p className="dashboard__subtitle">{t('admin.sell.empty')}</p> : null}
        {!loading && !error && requests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.property')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.owner')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.price')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.location')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.submitted')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.propertyTitle || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.fullName || '-'} ({request.phone || '-'})</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.askingPrice || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.location || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{formatCreatedAt(request.createdAt, locale)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="dashboard__btn dashboard__btn--view"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(request)}
                        disabled={deletingId === request.id}
                        className="dashboard__btn dashboard__btn--delete"
                      >
                        {deletingId === request.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadOne(request)}
                        className="dashboard__btn dashboard__btn--download"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      {selectedRequest ? (
        <div className="admin-modal__overlay" onClick={() => setSelectedRequest(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__avatar">
                {(selectedRequest.propertyTitle?.[0] || 'P').toUpperCase()}
              </div>
              <div>
                <h3 className="admin-modal__title">Sell Request Details</h3>
                <p className="admin-modal__subtitle">{selectedRequest.propertyTitle || '-'}</p>
              </div>
            </div>

            <div className="admin-modal__grid">
              <RequestDetail label="Property Type" value={selectedRequest.propertyType} />
              <RequestDetail label="Owner Name" value={selectedRequest.fullName} />
              <RequestDetail label="Phone" value={selectedRequest.phone} />
              <RequestDetail label="Email" value={selectedRequest.email} />
              <RequestDetail label="Price" value={selectedRequest.askingPrice} />
              <RequestDetail label="Location" value={selectedRequest.location} />
              <RequestDetail label="Submitted" value={formatCreatedAt(selectedRequest.createdAt, locale)} />
            </div>

            <div className="admin-modal__actions">
              <button type="button" onClick={() => setSelectedRequest(null)} className="admin-modal__close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}
