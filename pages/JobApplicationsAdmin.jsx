import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
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

function normalizeJobRequest(doc) {
  const data = doc.data()
  return {
    id: doc.id,
    firstName: getMappedField(data, 'firstName', 'First Name'),
    lastName: getMappedField(data, 'lastName', 'Last Name'),
    company: getMappedField(data, 'company', 'Company'),
    tel: getMappedField(data, 'tel', 'Tel'),
    email: getMappedField(data, 'email', 'Email'),
    address: getMappedField(data, 'address', 'Address'),
    pincode: getMappedField(data, 'pincode', 'Pincode'),
    cvName: getMappedField(data, 'cvName', 'CV'),
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

export default function JobApplicationsAdmin() {
  const { locale, t } = useLanguage()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCollection, setActiveCollection] = useState('jobs')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let fallbackUnsub = null
    const primaryQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
    const primaryUnsub = onSnapshot(
      primaryQuery,
      (snapshot) => {
        setRequests(snapshot.docs.map(normalizeJobRequest))
        setActiveCollection('jobs')
        setError('')
        setLoading(false)
      },
      () => {
        const fallbackQuery = query(collection(db, 'jobApplications'), orderBy('createdAt', 'desc'))
        fallbackUnsub = onSnapshot(
          fallbackQuery,
          (fallbackSnapshot) => {
            setRequests(fallbackSnapshot.docs.map(normalizeJobRequest))
            setActiveCollection('jobApplications')
            setError('')
            setLoading(false)
          },
          () => {
            setError('Unable to load job applications right now. Please try again later.')
            setLoading(false)
          },
        )
      },
    )

    return () => {
      primaryUnsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [])

  async function handleDelete(request) {
    const fullName = `${request.firstName || ''} ${request.lastName || ''}`.trim()
    const confirmed = window.confirm(
      t('admin.actions.confirmDeleteApplication', { name: fullName || t('admin.actions.thisUser') }),
    )
    if (!confirmed) return

    try {
      setDeletingId(request.id)
      await deleteDoc(doc(db, activeCollection, request.id))
    } catch {
      window.alert(t('admin.actions.deleteFailed'))
    } finally {
      setDeletingId('')
    }
  }

  return (
    <AdminLayout title={t('admin.jobs.title')} subtitle={t('admin.jobs.subtitle')}>
      <section className="dashboard__card">
        {loading ? <p className="dashboard__subtitle">{t('admin.jobs.loading')}</p> : null}
        {error ? <p className="dashboard__subtitle" style={{ color: '#b91c1c' }}>{error}</p> : null}
        {!loading && !error && requests.length === 0 ? <p className="dashboard__subtitle">{t('admin.jobs.empty')}</p> : null}
        {!loading && !error && requests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.name')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.contact')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.address')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.cv')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.submitted')}</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.firstName || '-'} {request.lastName || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.email || '-'} / {request.tel || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.address || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.cvName || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{formatCreatedAt(request.createdAt, locale)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="dashboard__btn dashboard__btn--view"
                      >
                        {t('admin.actions.view')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(request)}
                        disabled={deletingId === request.id}
                        className="dashboard__btn dashboard__btn--delete"
                      >
                        {deletingId === request.id ? t('admin.actions.deleting') : t('admin.actions.delete')}
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
                <h3 className="admin-modal__title">{t('admin.jobs.detailsTitle')}</h3>
                <p className="admin-modal__subtitle">
                  {selectedRequest.firstName || '-'} {selectedRequest.lastName || '-'}
                </p>
              </div>
            </div>

            <div className="admin-modal__grid">
              <RequestDetail label={t('job.company')} value={selectedRequest.company} />
              <RequestDetail label={t('job.email')} value={selectedRequest.email} />
              <RequestDetail label={t('job.tel')} value={selectedRequest.tel} />
              <RequestDetail label={t('job.address')} value={selectedRequest.address} />
              <RequestDetail label={t('job.pincode')} value={selectedRequest.pincode} />
              <RequestDetail label={t('admin.table.cv')} value={selectedRequest.cvName} />
              <RequestDetail label={t('admin.table.submitted')} value={formatCreatedAt(selectedRequest.createdAt, locale)} />
            </div>

            <div className="admin-modal__actions">
              <button type="button" onClick={() => setSelectedRequest(null)} className="admin-modal__close-btn">
                {t('admin.actions.close')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}
