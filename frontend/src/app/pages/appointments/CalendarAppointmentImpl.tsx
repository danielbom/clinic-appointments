import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import CalendarAppointment from './CalendarAppointment/CalendarAppointment'

import renderStatus from '../../../lib/renders/renderStatus'
import renderHour from '../../../lib/renders/renderHour'

import {
  useAppointmentsCalendarCountQuery,
  useAppointmentsCalendarQuery,
  useAppointmentsCountQuery,
} from '../../hooks/queries/appointments'

type CalendarAppointmentProps = {
  onClickTable: () => void
}

function CalendarAppointmentImpl({ onClickTable }: CalendarAppointmentProps) {
  const [currentDate, setCurrentDate] = useState(() => dayjs())
  const currentYear = currentDate.year()

  const params = useMemo(() => {
    const date = dayjs(new Date(currentYear, 0, 1))
    const startDate = date.startOf('year').format('YYYY-MM-DD')
    const endDate = date.endOf('year').format('YYYY-MM-DD')
    return { startDate, endDate }
  }, [currentYear])

  const queryCount = useAppointmentsCountQuery({ params: {} })
  const queryCalendarData = useAppointmentsCalendarQuery({ params })
  const queryCalendarCount = useAppointmentsCalendarCountQuery({ params })

  const total = queryCount.data ?? 0
  const dayItems = useMemo(
    () =>
      (queryCalendarData.data ?? []).map((it) => ({
        id: it.id,
        date: it.date,
        description: renderHour(it.time) + ' ' + it.specialistName,
        status: renderStatus(it.status),
      })),
    [queryCalendarData.data],
  )
  const monthItems = queryCalendarCount.data ?? []

  return (
    <CalendarAppointment
      total={total}
      dayItems={dayItems}
      monthItems={monthItems}
      date={currentDate}
      onChangeDate={setCurrentDate}
      onClickTable={onClickTable}
    />
  )
}

export default CalendarAppointmentImpl
