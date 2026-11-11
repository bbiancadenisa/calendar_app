import { calendarData } from './calendarData'
import type { CalendarDay } from './calendarData'

export const weekdays = [
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
export const firstWeekdayIndex = new Date(
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
export const calendarWeeks = Array.from(
  { length: calendarCells.length / 7 },
  (_, index) => calendarCells.slice(index * 7, index * 7 + 7),
)

export const formatAccessibleDate = (date: string) =>
  fullDateFormatter.format(new Date(`${date}T00:00:00.000Z`))
