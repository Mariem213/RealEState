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
    const confirmed = window.confirm(
      t('admin.actions.confirmDeleteRequest', { name: fullName || t('admin.actions.thisUser') }),
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

  function optionLabel(path, value) {
    if (!value) return '-'
    const key = `${path}.${value}`
    const resolved = t(key)
    return resolved === key ? value : resolved
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
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.firstName} {request.lastName}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.company || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.email || '-'} / {request.tel || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      {optionLabel('investmentForm.options.investorType', request.investorType)} / {optionLabel('investmentForm.options.ticketSize', request.ticketSize)}
                    </td>
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
                <h3 className="admin-modal__title">{t('admin.investment.detailsTitle')}</h3>
                <p className="admin-modal__subtitle">
                  {selectedRequest.firstName || '-'} {selectedRequest.lastName || '-'}
                </p>
              </div>
            </div>

            <div className="admin-modal__grid">
              <RequestDetail label={t('admin.table.company')} value={selectedRequest.company} />
              <RequestDetail label={t('investmentForm.email')} value={selectedRequest.email} />
              <RequestDetail label={t('investmentForm.tel')} value={selectedRequest.tel} />
              <RequestDetail
                label={t('investmentForm.investorType')}
                value={optionLabel('investmentForm.options.investorType', selectedRequest.investorType)}
              />
              <RequestDetail
                label={t('investmentForm.expertise')}
                value={optionLabel('investmentForm.options.expertise', selectedRequest.expertise)}
              />
              <RequestDetail
                label={t('investmentForm.opportunityType')}
                value={optionLabel('investmentForm.options.opportunityType', selectedRequest.opportunityType)}
              />
              <RequestDetail
                label={t('investmentForm.investmentMethod')}
                value={optionLabel('investmentForm.options.investmentMethod', selectedRequest.investmentMethod)}
              />
              <RequestDetail
                label={t('investmentForm.ticketSize')}
                value={optionLabel('investmentForm.options.ticketSize', selectedRequest.ticketSize)}
              />
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
