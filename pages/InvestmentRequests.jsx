import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useLanguage } from '../context/LanguageContext'
import AdminLayout from '../components/AdminLayout'
import '../styles/Dashboard.css'

function formatCreatedAt(value, locale) {
  if (!value?.toDate) return '-'
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate())
}

function getMappedField(request, modernKey, legacyKey) {
  return request[modernKey] ?? request[legacyKey] ?? ''
}

function normalizeInvestmentRequest(doc) {
  const data = doc.data()
  return {
    id: doc.id,
    firstName: getMappedField(data, 'firstName', 'First Name'),
    lastName: getMappedField(data, 'lastName', 'Last Name'),
    company: getMappedField(data, 'company', 'Company'),
    email: getMappedField(data, 'email', 'Email'),
    tel: getMappedField(data, 'tel', 'Tel'),
    investorType: getMappedField(data, 'investorType', 'Investor Type'),
    expertise: getMappedField(data, 'expertise', 'Expertise'),
    opportunityType: getMappedField(data, 'opportunityType', 'What type of opportunity are you looking for?'),
    investmentMethod: getMappedField(data, 'investmentMethod', 'Preferred Investment Method'),
    ticketSize: getMappedField(data, 'ticketSize', 'Ticket size (SAR)'),
    createdAt: data.createdAt ?? null,
  }
}

function RequestDetail({ label, value }) {
  return (
    <div className="admin-modal__item">
      <p className="admin-modal__label">{label}</p>
      <p className="admin-modal__value">{value || '-'}</p>
    </div>
  )
}

export default function InvestmentRequests() {
  const { locale, t } = useLanguage()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCollection, setActiveCollection] = useState('investments')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let fallbackUnsub = null
    const primaryUnsub = onSnapshot(
      collection(db, 'investments'),
      (snapshot) => {
        setRequests(snapshot.docs.map(normalizeInvestmentRequest))
        setActiveCollection('investments')
        setError('')
        setLoading(false)
      },
      () => {
        fallbackUnsub = onSnapshot(
          collection(db, 'investmentRequests'),
          (fallbackSnapshot) => {
            setRequests(fallbackSnapshot.docs.map(normalizeInvestmentRequest))
            setActiveCollection('investmentRequests')
            setError('')
            setLoading(false)
          },
          () => {
            setError(t('admin.investment.errors.loadFailed'))
            setLoading(false)
          },
        )
      },
    )
    return () => {
      primaryUnsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [t])

  async function handleDelete(request) {
    const fullName = `${request.firstName || ''} ${request.lastName || ''}`.trim()
    const confirmed = window.confirm(`Delete request for ${fullName || 'this user'}?`)
    if (!confirmed) return

    try {
      setDeletingId(request.id)
      await deleteDoc(doc(db, activeCollection, request.id))
    } catch {
      window.alert('Unable to delete this request right now. Please try again later.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <AdminLayout title={t('admin.investment.title')} subtitle={t('admin.investment.subtitle')}>
      <section className="dashboard__card">
        {loading ? <p className="dashboard__subtitle">{t('admin.investment.loading')}</p> : null}
        {error ? <p className="dashboard__subtitle" style={{ color: '#b91c1c' }}>{error}</p> : null}
        {!loading && !error && requests.length === 0 ? <p className="dashboard__subtitle">{t('admin.investment.empty')}</p> : null}
        {!loading && !error && requests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.name')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.company')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.contact')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.preferences')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.submitted')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.firstName} {request.lastName}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.company || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.email || '-'} / {request.tel || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.investorType || '-'} / {request.ticketSize || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{formatCreatedAt(request.createdAt, locale)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        style={{ marginRight: '8px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(request)}
                        disabled={deletingId === request.id}
                        style={{ padding: '6px 10px', border: '1px solid #fecaca', borderRadius: '8px', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}
                      >
                        {deletingId === request.id ? 'Deleting...' : 'Delete'}
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
                {(selectedRequest.firstName?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <h3 className="admin-modal__title">Investment Request Details</h3>
                <p className="admin-modal__subtitle">
                  {selectedRequest.firstName || '-'} {selectedRequest.lastName || '-'}
                </p>
              </div>
            </div>

            <div className="admin-modal__grid">
              <RequestDetail label="Company" value={selectedRequest.company} />
              <RequestDetail label="Email" value={selectedRequest.email} />
              <RequestDetail label="Phone" value={selectedRequest.tel} />
              <RequestDetail label="Investor Type" value={selectedRequest.investorType} />
              <RequestDetail label="Expertise" value={selectedRequest.expertise} />
              <RequestDetail label="Opportunity Type" value={selectedRequest.opportunityType} />
              <RequestDetail label="Investment Method" value={selectedRequest.investmentMethod} />
              <RequestDetail label="Ticket Size" value={selectedRequest.ticketSize} />
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
