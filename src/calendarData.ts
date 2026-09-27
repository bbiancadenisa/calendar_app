export type CalendarDay = {
  date: string
  dayOfMonth: number
  weekday: string
}

export type CalendarEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
}

export type CalendarData = {
  month: {
    name: string
    number: number
    year: number
  }
  days: CalendarDay[]
  events: CalendarEvent[]
}

const year = 2026
const monthNumber = 9
const monthIndex = monthNumber - 1
const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})

export const calendarData: CalendarData = {
  month: {
    name: 'September',
    number: monthNumber,
    year,
  },
  days: Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(Date.UTC(year, monthIndex, index + 1))

    return {
      date: date.toISOString().slice(0, 10),
      dayOfMonth: index + 1,
      weekday: weekdayFormatter.format(date),
    }
  }),
  events: [
    {
      id: 'event-1',
      title: 'Team check-in',
      date: '2026-09-07',
      startTime: '10:00',
      endTime: '10:30',
    },
    {
      id: 'event-2',
      title: 'Coffee with Alex',
      date: '2026-09-13',
      startTime: '11:00',
      endTime: '11:30',
    },
    {
      id: 'event-3',
      title: 'Lunch with Morgan',
      date: '2026-09-24',
      startTime: '12:00',
      endTime: '13:00',
    },
  ],
}
