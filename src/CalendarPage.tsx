import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useMediaQuery } from 'react-responsive'
import './CalendarPage.css'
import { calendarData } from './calendarData'
import type { CalendarDay, CalendarEvent } from './calendarData'
import CalendarHeader from './CalendarHeader'
import CalendarEvents from './CalendarEvents'
import EventPopup from './EventPopup'
import type { EventPopupState } from './EventPopup'
import { calendarWeeks, firstWeekdayIndex, formatAccessibleDate, weekdays } from './calendarUtils'

const CalendarPage = () => {
  const isNarrowViewport = useMediaQuery({ maxWidth: 480 })
  const isShortViewport = useMediaQuery({ maxHeight: 420 })
  const isListViewport = isNarrowViewport || isShortViewport
  const [focusedDate, setFocusedDate] = useState(calendarData.days[0]?.date ?? '')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState(calendarData.events)
  const [popup, setPopup] = useState<EventPopupState | null>(null)
  const popupOpener = useRef<HTMLElement | null>(null)
  const [announcement, setAnnouncement] = useState(
    `Showing ${calendarData.month.name} ${calendarData.month.year}`,
  )
  const dayElements = useRef(new Map<string, HTMLElement>())

  const getEventsForDate = (date: string) => events.filter((event) => event.date === date)
    .sort((first, second) => first.startTime.localeCompare(second.startTime))

  const getDayAccessibleName = (day: CalendarDay) =>
    [formatAccessibleDate(day.date), ...getEventsForDate(day.date).map((event) => event.title)].join('. ')

  const openPopup = (event: CalendarEvent, mode: EventPopupState['mode']) => {
    popupOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPopup({ event, mode })
  }

  const closePopup = () => {
    setPopup(null)
    if (popupOpener.current?.isConnected) popupOpener.current.focus()
    else dayElements.current.get(focusedDate)?.focus()
  }

  const addEvent = () => openPopup({
    id: crypto.randomUUID(), title: '', description: '',
    date: selectedDate ?? calendarData.days[0].date,
    startTime: '09:00', endTime: '09:30',
  }, 'create')

  const selectDate = (day: CalendarDay) => {
    setSelectedDate(day.date)
    setAnnouncement(`Selected ${getDayAccessibleName(day)}`)
  }

  const moveFocusToDay = (dayIndex: number) => {
    const day = calendarData.days[dayIndex]

    if (!day) return

    setFocusedDate(day.date)
    dayElements.current.get(day.date)?.focus()
  }

  const handleDateKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    dayIndex: number,
  ) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectDate(calendarData.days[dayIndex])
      return
    }

    let nextDayIndex: number | undefined

    if (isListViewport) {
      if (event.key === 'ArrowDown') nextDayIndex = dayIndex + 1
      if (event.key === 'ArrowUp') nextDayIndex = dayIndex - 1
      if (event.key === 'Home') nextDayIndex = 0
      if (event.key === 'End') nextDayIndex = calendarData.days.length - 1
    } else {
      if (event.key === 'ArrowRight') nextDayIndex = dayIndex + 1
      if (event.key === 'ArrowLeft') nextDayIndex = dayIndex - 1
      if (event.key === 'ArrowDown') nextDayIndex = dayIndex + 7
      if (event.key === 'ArrowUp') nextDayIndex = dayIndex - 7

      if (event.key === 'Home' || event.key === 'End') {
        const weekIndex = Math.floor((firstWeekdayIndex + dayIndex) / 7)
        const weekStart = weekIndex * 7 - firstWeekdayIndex
        nextDayIndex =
          event.key === 'Home'
            ? Math.max(0, weekStart)
            : Math.min(calendarData.days.length - 1, weekStart + 6)
      }
    }

    if (nextDayIndex === undefined) return

    event.preventDefault()
    moveFocusToDay(nextDayIndex)
  }

  return (
    <div className="calendar-page">
      {isNarrowViewport || isShortViewport ? (
        <div className="calendar-container">
          <CalendarHeader onAdd={addEvent} />
          <div className="calendar-list-days" role="list" aria-label={`${calendarData.month.name} ${calendarData.month.year}`}>
            {calendarData.days.map((day, dayIndex) => {
              return (
                <div
                  className="calendar-list-day"
                  key={day.date}
                  role="listitem"
                  aria-label={getDayAccessibleName(day)}
                  data-selected={selectedDate === day.date}
                  aria-posinset={dayIndex + 1}
                  aria-setsize={calendarData.days.length}
                  tabIndex={focusedDate === day.date ? 0 : -1}
                  ref={(element) => {
                    if (element) dayElements.current.set(day.date, element)
                    else dayElements.current.delete(day.date)
                  }}
                  onFocus={() => setFocusedDate(day.date)}
                  onKeyDown={(event) => handleDateKeyDown(event, dayIndex)}
                  onClick={() => selectDate(day)}
                >
                  <span className="calendar-list-date">
                    <span className="calendar-list-weekday">{day.weekday}</span>
                    <span>{day.dayOfMonth}</span>
                  </span>
                  <CalendarEvents
                    events={getEventsForDate(day.date)}
                    className="calendar-list-event"
                    onOpen={(event) => openPopup(event, 'view')}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="calendar-container">
          <CalendarHeader onAdd={addEvent} />
          <div
            className="calendar-days"
            role="grid"
            aria-label={`${calendarData.month.name} ${calendarData.month.year}`}
            aria-rowcount={calendarWeeks.length + 1}
            aria-colcount={7}
            aria-describedby="calendar-announcement"
          >
            <div className="calendar-weekdays" role="row">
              {weekdays.map((weekday) => (
                <div
                  className="calendar-weekday"
                  key={weekday.short}
                  role="columnheader"
                  aria-label={weekday.full}
                >
                  {weekday.short}
                </div>
              ))}
            </div>
            {calendarWeeks.map((week, weekIndex) => (
              <div className="calendar-week" role="row" key={weekIndex}>
                {week.map((cell) => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <div
                        className="calendar-day calendar-day-outside"
                        key={cell.date}
                        role="gridcell"
                        aria-disabled="true"
                        aria-label={getDayAccessibleName(cell)}
                      >
                        <span>{cell.dayOfMonth}</span>
                      </div>
                    )
                  }

                  const dayIndex = cell.dayOfMonth - 1

                  return (
                    <div
                      className="calendar-day"
                      key={cell.date}
                      role="gridcell"
                      aria-label={getDayAccessibleName(cell)}
                      aria-selected={selectedDate === cell.date}
                      tabIndex={focusedDate === cell.date ? 0 : -1}
                      ref={(element) => {
                        if (element) dayElements.current.set(cell.date, element)
                        else dayElements.current.delete(cell.date)
                      }}
                      onFocus={() => setFocusedDate(cell.date)}
                      onKeyDown={(event) =>
                        handleDateKeyDown(event, dayIndex)
                      }
                      onClick={() => selectDate(cell)}
                    >
                      <span>{cell.dayOfMonth}</span>
                      <CalendarEvents
                        events={getEventsForDate(cell.date)}
                        className="calendar-event"
                        onOpen={(event) => openPopup(event, 'view')}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      {popup && <EventPopup popup={popup} onClose={closePopup}
        onSave={(savedEvent) => {
          setEvents((current) => popup.mode === 'create' ? [...current, savedEvent]
            : current.map((event) => event.id === savedEvent.id ? savedEvent : event))
          setAnnouncement(`${savedEvent.title} ${popup.mode === 'create' ? 'created' : 'updated'}.`)
          closePopup()
        }}
        onDelete={(deletedEvent) => {
          setEvents((current) => current.filter((event) => event.id !== deletedEvent.id))
          setAnnouncement(`${deletedEvent.title} deleted.`)
          closePopup()
        }} />}
      <div
        className="calendar-live-region"
        id="calendar-announcement"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      </div>
  )
}

export default CalendarPage
