import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useMediaQuery } from 'react-responsive'
import './CalendarPage.css'
import { calendarData } from './calendarData'
import type { CalendarDay } from './calendarData'

const weekdays = [
  { short: 'Sun', full: 'Sunday' },
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
]

type CalendarCell = CalendarDay & { isCurrentMonth: boolean }

const monthIndex = calendarData.month.number - 1
const firstWeekdayIndex = new Date(
  Date.UTC(calendarData.month.year, monthIndex, 1),
).getUTCDay()
const trailingDayCount =
  (7 - ((firstWeekdayIndex + calendarData.days.length) % 7)) % 7
const shortWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})
const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const createCalendarCell = (date: Date): CalendarCell => ({
  date: date.toISOString().slice(0, 10),
  dayOfMonth: date.getUTCDate(),
  weekday: shortWeekdayFormatter.format(date),
  isCurrentMonth:
    date.getUTCFullYear() === calendarData.month.year &&
    date.getUTCMonth() === monthIndex,
})

const leadingDays = Array.from({ length: firstWeekdayIndex }, (_, index) =>
  createCalendarCell(
    new Date(
      Date.UTC(
        calendarData.month.year,
        monthIndex,
        index - firstWeekdayIndex + 1,
      ),
    ),
  ),
)
const currentMonthDays = calendarData.days.map((day) => ({
  ...day,
  isCurrentMonth: true,
}))
const trailingDays = Array.from({ length: trailingDayCount }, (_, index) =>
  createCalendarCell(
    new Date(
      Date.UTC(
        calendarData.month.year,
        monthIndex,
        calendarData.days.length + index + 1,
      ),
    ),
  ),
)
const calendarCells = [...leadingDays, ...currentMonthDays, ...trailingDays]
const calendarWeeks = Array.from(
  { length: calendarCells.length / 7 },
  (_, index) => calendarCells.slice(index * 7, index * 7 + 7),
)
const eventsByDate = new Map(
  calendarData.events.map((calendarEvent) => [calendarEvent.date, calendarEvent]),
)

const formatAccessibleDate = (date: string) =>
  fullDateFormatter.format(new Date(`${date}T00:00:00.000Z`))

const getDayAccessibleName = (day: CalendarDay) => {
  const event = eventsByDate.get(day.date)

  return event
    ? `${formatAccessibleDate(day.date)}. ${event.title}`
    : formatAccessibleDate(day.date)
}

const CalendarHeader = () => (
  <header className="calendar-header">
    <h1 className="calendar-title">Calendar</h1>
    <button className="add-event-button" type="button">
      Add event
    </button>
  </header>
)

const CalendarPage = () => {
  const isNarrowViewport = useMediaQuery({ maxWidth: 480 })
  const isShortViewport = useMediaQuery({ maxHeight: 420 })
  const isListViewport = isNarrowViewport || isShortViewport
  const [focusedDate, setFocusedDate] = useState(calendarData.days[0]?.date ?? '')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState(
    `Showing ${calendarData.month.name} ${calendarData.month.year}`,
  )
  const dayElements = useRef(new Map<string, HTMLElement>())

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
          <CalendarHeader />
          <div className="calendar-list-days">
            {calendarData.days.map((day, dayIndex) => {
              const event = eventsByDate.get(day.date)

              return (
                <div
                  className="calendar-list-day"
                  key={day.date}
                  role="option"
                  aria-label={getDayAccessibleName(day)}
                  aria-selected={selectedDate === day.date}
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
                  {event && (
                    <span className="calendar-list-event">{event.title}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="calendar-container">
          <CalendarHeader />
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
                  const event = eventsByDate.get(cell.date)

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
                      {event && (
                        <span className="calendar-event">{event.title}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
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
