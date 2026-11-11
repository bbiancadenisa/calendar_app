import { useEffect, useRef, useState } from 'react'
import { calendarData } from './calendarData'
import type { CalendarEvent } from './calendarData'
import { formatAccessibleDate } from './calendarUtils'

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const timeOptions = Array.from({ length: 96 }, (_, index) => toTime(index * 15))

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}${remainingMinutes ? ` and ${remainingMinutes} min` : ''}`
}

export type EventPopupState = { event: CalendarEvent; mode: 'create' | 'view' | 'edit' }

type EventPopupProps = {
  popup: EventPopupState
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
}

const EventPopup = ({ popup, onClose, onSave, onDelete }: EventPopupProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState(popup.mode)
  const [draft, setDraft] = useState(popup.event)
  const [duration, setDuration] = useState(
    toMinutes(popup.event.endTime) - toMinutes(popup.event.startTime),
  )
  const isViewing = mode === 'view'
  const endTime = toTime(toMinutes(draft.startTime) + duration)
  const maxDuration = Math.min(120, 1440 - toMinutes(draft.startTime))

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>(isViewing ? '#event-popup-title' : '#event-title')?.focus()
  }, [isViewing])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      className="event-popup"
      ref={dialogRef}
      aria-labelledby="event-popup-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) close()
      }}
    >
      <h2 id="event-popup-title" tabIndex={-1}>
        {isViewing ? draft.title : mode === 'create' ? 'Add event' : 'Edit event'}
      </h2>
      {isViewing ? (
        <>
          <dl className="event-details">
            <dt>Date</dt><dd>{formatAccessibleDate(draft.date)}</dd>
            <dt>Time</dt><dd>{draft.startTime} - {draft.endTime === '24:00' ? '24:00 (midnight)' : draft.endTime}</dd>
            <dt>Duration</dt><dd>{formatDuration(duration)}</dd>
            <dt>Description</dt><dd className="event-description">{draft.description || 'No description'}</dd>
          </dl>
          <div className="event-popup-actions">
            <button type="button" className="event-delete-button" onClick={() => onDelete(draft)}>Delete event</button>
            <button type="button" onClick={close}>Close</button>
            <button type="button" className="add-event-button" onClick={() => setMode('edit')}>Edit event</button>
          </div>
        </>
      ) : (
        <form onSubmit={(event) => {
          event.preventDefault()
          const titleInput = event.currentTarget.elements.namedItem('title') as HTMLInputElement
          titleInput.setCustomValidity(draft.title.trim() ? '' : 'Enter an event title.')
          if (!event.currentTarget.reportValidity()) return
          onSave({ ...draft, title: draft.title.trim(), endTime })
        }}>
          <label htmlFor="event-title">Title</label>
          <input id="event-title" name="title" required maxLength={120} value={draft.title} onChange={(event) => {
            event.target.setCustomValidity('')
            setDraft({ ...draft, title: event.target.value })
          }} />
          <label htmlFor="event-description">Description</label>
          <textarea id="event-description" rows={3} maxLength={5000} value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <label htmlFor="event-date">Date</label>
          <input id="event-date" type="date" required min={calendarData.days[0].date} max={calendarData.days[calendarData.days.length - 1].date} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          <div className="event-time-fields">
            <div>
              <label htmlFor="event-start">Start time</label>
              <select id="event-start" value={draft.startTime} onChange={(event) => {
                setDraft({ ...draft, startTime: event.target.value })
                setDuration(Math.min(duration, 1440 - toMinutes(event.target.value)))
              }}>
                {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="event-duration">Duration</label>
              <select id="event-duration" value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                {Array.from({ length: maxDuration / 15 }, (_, index) => (index + 1) * 15).map((minutes) => (
                  <option key={minutes} value={minutes}>{formatDuration(minutes)}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="event-time-summary" aria-live="polite">{draft.startTime} - {endTime === '24:00' ? '24:00 (midnight)' : endTime}</p>
          <div className="event-popup-actions">
            <button type="button" onClick={close}>Cancel</button>
            <button type="submit" className="add-event-button">{mode === 'create' ? 'Create event' : 'Save changes'}</button>
          </div>
        </form>
      )}
    </dialog>
  )
}

export default EventPopup
