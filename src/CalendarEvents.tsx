import type { CalendarEvent } from './calendarData'

type CalendarEventsProps = {
  events: CalendarEvent[]
  className: string
  onOpen: (event: CalendarEvent) => void
}

const CalendarEvents = ({ events, className, onOpen }: CalendarEventsProps) => (
  <div className="calendar-event-stack">
    {events.map((event) => (
      <button
        key={event.id}
        type="button"
        className={className}
        aria-label={`${event.title}, ${event.startTime} to ${event.endTime}`}
        aria-haspopup="dialog"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation()
          onOpen(event)
        }}
      >
        {event.title}
      </button>
    ))}
  </div>
)

export default CalendarEvents
