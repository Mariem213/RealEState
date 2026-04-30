import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { jsPDF } from 'jspdf'
import { useLanguage } from '../context/LanguageContext'
import AdminLayout from '../components/AdminLayout'
import { db } from '../firebase'
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

function getMappedField(request, modernKey, legacyKey) {
  return request?.[modernKey] ?? request?.[legacyKey] ?? ''
}

function normalizeSellRequestDoc(docSnapshot, sourceCollection) {
  const data = docSnapshot.data() ?? {}
  return {
    id: docSnapshot.id,
    propertyTitle: getMappedField(data, 'propertyTitle', 'Property Title'),
    propertyType: getMappedField(data, 'propertyType', 'Property Type'),
    fullName: getMappedField(data, 'fullName', 'Full Name'),
    phone: getMappedField(data, 'phone', 'Phone'),
    email: getMappedField(data, 'email', 'Email'),
    askingPrice: getMappedField(data, 'askingPrice', 'Asking Price'),
    location: getMappedField(data, 'location', 'Location'),
    createdAt: data.createdAt ?? null,
    localId: data.localId || '',
    sourceCollection,
  }
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

function mergeAndSortRequests(remoteList) {
  const localList = readLocalSellRequests().map((item) => ({
    ...item,
    localId: item.id || '',
    sourceCollection: 'local',
  }))
  const makeFingerprint = (item) => {
    const createdMs = item?.createdAt?.toDate
      ? item.createdAt.toDate().getTime()
      : new Date(item?.createdAt || 0).getTime()
    const createdSlot = Number.isFinite(createdMs) ? Math.floor(createdMs / 60000) : 0
    return [
      String(item?.propertyTitle || '').trim().toLowerCase(),
      String(item?.fullName || '').trim().toLowerCase(),
      String(item?.phone || '').trim().toLowerCase(),
      String(item?.askingPrice ?? ''),
      String(item?.location || '').trim().toLowerCase(),
      String(createdSlot),
    ].join('|')
  }

  const localByKey = new Map()
  for (const item of localList) {
    const key = item.localId || makeFingerprint(item)
    localByKey.set(key, item)
  }

  const mergedMap = new Map(localByKey)
  for (const remoteItem of remoteList) {
    const key = remoteItem.localId || makeFingerprint(remoteItem)
    const existing = mergedMap.get(key)
    mergedMap.set(key, existing ? { ...existing, ...remoteItem } : remoteItem)
  }

  const merged = Array.from(mergedMap.values())
  merged.sort((a, b) => {
    const first = new Date(a.createdAt || 0).getTime()
    const second = new Date(b.createdAt || 0).getTime()
    return second - first
  })
  return merged
}

export default function SellRequests() {
  const { locale, t } = useLanguage()
  const [requests, setRequests] = useState([])
  const [remoteRequests, setRemoteRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    const primaryQuery = query(collection(db, 'sell'), orderBy('createdAt', 'desc'))
    let fallbackUnsub = null
    const primaryUnsub = onSnapshot(
      primaryQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((item) => normalizeSellRequestDoc(item, 'sell'))
        setRemoteRequests(mapped)
        setRequests(mergeAndSortRequests(mapped))
        setError('')
        setLoading(false)
      },
      () => {
        const fallbackQuery = query(collection(db, 'sellRequests'), orderBy('createdAt', 'desc'))
        fallbackUnsub = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const mapped = snapshot.docs.map((item) => normalizeSellRequestDoc(item, 'sellRequests'))
            setRemoteRequests(mapped)
            setRequests(mergeAndSortRequests(mapped))
            setError('')
            setLoading(false)
          },
          () => {
            setRemoteRequests([])
            setRequests(mergeAndSortRequests([]))
            setError('')
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

  useEffect(() => {
    const handleStorage = () => {
      setRequests(mergeAndSortRequests(remoteRequests))
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [remoteRequests])

  async function handleDelete(request) {
    const confirmed = window.confirm(
      t('admin.actions.confirmDeleteRequest', {
        name: request.propertyTitle || t('admin.actions.thisProperty'),
      }),
    )
    if (!confirmed) return

    try {
      setDeletingId(request.id)
      if (request.sourceCollection === 'local') {
        const updated = readLocalSellRequests().filter((item) => item.id !== request.id)
        saveLocalSellRequests(updated)
        setRequests(mergeAndSortRequests(remoteRequests))
      } else {
        await deleteDoc(doc(db, request.sourceCollection || 'sell', request.id))
      }
    } catch {
      window.alert(t('admin.actions.deleteFailed'))
    } finally {
      setDeletingId('')
    }
  }

  function propertyTypeLabel(value) {
    if (!value) return '-'
    const key = `home.propertyTypes.${value}`
    const resolved = t(key)
    return resolved === key ? value : resolved
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
          <button type="button" onClick={handleDownloadAll} className="dashboard__btn dashboard__btn--download-all">
            {t('admin.actions.downloadAll')}
          </button>
        ) : null
      }
    >
      <section className="dashboard__card">
        {loading ? <p className="dashboard__subtitle">{t('admin.sell.loading')}</p> : null}
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
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={`${request.sourceCollection || 'mixed'}-${request.id}`}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.propertyTitle || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.fullName || '-'} ({request.phone || '-'})</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.askingPrice || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{request.location || '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{formatCreatedAt(request.createdAt, locale)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => setSelectedRequest(request)} className="dashboard__btn dashboard__btn--view">
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
                      <button type="button" onClick={() => handleDownloadOne(request)} className="dashboard__btn dashboard__btn--download">
                        {t('admin.actions.download')}
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
              <div className="admin-modal__avatar">{(selectedRequest.propertyTitle?.[0] || 'P').toUpperCase()}</div>
              <div>
                <h3 className="admin-modal__title">{t('admin.sell.detailsTitle')}</h3>
                <p className="admin-modal__subtitle">{selectedRequest.propertyTitle || '-'}</p>
              </div>
            </div>
            <div className="admin-modal__grid">
              <RequestDetail label={t('sell.propertyType')} value={propertyTypeLabel(selectedRequest.propertyType)} />
              <RequestDetail label={t('admin.table.owner')} value={selectedRequest.fullName} />
              <RequestDetail label={t('sell.phone')} value={selectedRequest.phone} />
              <RequestDetail label={t('sell.email')} value={selectedRequest.email} />
              <RequestDetail label={t('admin.table.price')} value={selectedRequest.askingPrice} />
              <RequestDetail label={t('admin.table.location')} value={selectedRequest.location} />
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
