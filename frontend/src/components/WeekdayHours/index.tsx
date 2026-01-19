import { useCallback, useEffect, useState } from 'react'
import { Calendar, dayjsLocalizer, SlotInfo, Views } from 'react-big-calendar'
import dayjs, { Dayjs } from 'dayjs'
import { useUndo } from '../../hooks/useUndo'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './index.css'

type AgendaEvent = {
  start: Date
  end: Date
  title: string
}

const weekdays = [
  { title: 'Domingo' },
  { title: 'Segunda-feira' },
  { title: 'Terça-feira' },
  { title: 'Quarta-feira' },
  { title: 'Quinta-feira' },
  { title: 'Sexta-feira' },
  { title: 'Sabado' },
]

const localizer = dayjsLocalizer(dayjs)

const min = dayjs('2020-10-10T06:00:00').toDate()
const max = dayjs('2020-10-10T22:00:00').toDate()

function setTime(day: Dayjs, date: Date): Dayjs {
  return day.set('hour', date.getHours()).set('minute', date.getMinutes())
}
function between(day: Dayjs, start: Dayjs, end: Dayjs) {
  return day.isSame(start) || day.isSame(end) || (day.isAfter(start) && day.isBefore(end))
}
function normalize(start: Date, end: Date, selected: AgendaEvent | undefined, allDay: boolean) {
  let startDay = dayjs(start).set('seconds', 0)
  let endDay = dayjs(end).set('seconds', 0)
  if (allDay) {
    startDay = setTime(startDay, selected?.start || min)
    endDay = setTime(endDay, selected?.end || max)
  }
  return { startDay, endDay }
}
function intersects(it: AgendaEvent, startDay: Dayjs, endDay: Dayjs, day: number) {
  if (it.start.getDay() === day) {
    const itStartDay = dayjs(it.start)
    const itEndDay = dayjs(it.end)
    return (
      !between(itStartDay, startDay, endDay) &&
      !between(itEndDay, startDay, endDay) &&
      !between(startDay, itStartDay, itEndDay) &&
      !between(endDay, itStartDay, itEndDay)
    )
  }
  return true
}

// TODO: App parameters
// - minHours
// - maxHours
export default function WeekdayHours() {
  const [selected, setSelected] = useState<AgendaEvent[]>([])
  const { top: events, pushUndo, popUndo, popRedo } = useUndo<AgendaEvent[]>([])

  const handleSelectSlot = useCallback(
    ({ start, end, bounds, action }: SlotInfo) => {
      const allDay = action === 'click' || !bounds
      const { endDay, startDay } = normalize(start, end, selected[0], allDay)
      if (events.some((it) => dayjs(it.start).isSame(startDay) && dayjs(it.end).isSame(endDay))) return

      if (startDay.get('date') !== endDay.get('date')) {
        pushUndo(events.filter((it) => it.start.getDay() !== start.getDay()))
      } else {
        pushUndo(
          events
            .filter((it) => intersects(it, startDay, endDay, start.getDay()))
            .concat([{ start: startDay.toDate(), end: endDay.toDate(), title: weekdays[start.getDay()].title }]),
        )
      }
    },
    [pushUndo, events, selected],
  )

  const handleSelectEvent = useCallback(
    (event: AgendaEvent) =>
      setSelected(selected.length > 0 && dayjs(selected[0].start).isSame(event.start) ? [] : [event]),
    [selected],
  )

  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      switch (ev.key) {
        case 'Delete': {
          if (selected.length > 0) {
            const startDay = dayjs(selected[0].start)
            pushUndo(events.filter((it) => !startDay.isSame(it.start)))
            setSelected([])
          }
          break
        }
        case 'z': {
          if (ev.ctrlKey) popUndo(events)
          break
        }
        case 'y': {
          if (ev.ctrlKey) popRedo()
          break
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [selected, events, popRedo, popUndo])

  return (
    <Calendar
      selectable
      components={{
        header: AgendaHeader,
      }}
      min={min}
      max={max}
      showAllEvents={false}
      view={Views.WEEK}
      views={{ [Views.WEEK]: true }}
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      onSelectSlot={handleSelectSlot}
      onSelectEvent={handleSelectEvent}
      toolbar={false}
      onView={(view) => {
        console.log(view)
      }}
    />
  )
}

function AgendaHeader({ date }: { date: Date }) {
  return <span>{weekdays[date.getDay()].title}</span>
}
