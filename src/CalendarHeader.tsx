type CalendarHeaderProps = {
  onAdd: () => void
}

const CalendarHeader = ({ onAdd }: CalendarHeaderProps) => (
  <header className="calendar-header">
    <h1 className="calendar-title">Calendar</h1>
    <button className="add-event-button" type="button" onClick={onAdd} aria-haspopup="dialog">
      Add event
    </button>
  </header>
)

export default CalendarHeader