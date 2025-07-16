import './CalendarAppointment.css'
import { useState } from 'react'
import { Avatar, Badge, BadgeProps, Button, Calendar, CalendarProps, Radio, Select, Space, theme, Tooltip } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { RightOutlined, LeftOutlined, TableOutlined } from '@ant-design/icons'

import TableX from '../../../../components/TableX'

type DayListItem = {
  id: string
  date: string
  status: BadgeProps['status']
  description: string
}

type MonthListItem = {
  month: number
  pendingCount: number
  realizedCount: number
  canceledCount: number
}

type CalendarAppointmentProps = {
  total: number
  dayItems: DayListItem[]
  monthItems: MonthListItem[]
  date: Dayjs
  onChangeDate: (date: Dayjs) => void
  onClickTable: () => void
}

function CalendarAppointment({
  total,
  dayItems,
  monthItems,
  date,
  onChangeDate,
  onClickTable,
}: CalendarAppointmentProps) {
  const [currentMode, setCurrentMode] = useState<'year' | 'month'>('month')
  return (
    <>
      <TableX.Header.Container>
        <TableX.Header.First>
          <TableX.Header.Title title="Agendamentos" count={total} />
          <TableX.Header.Buttons>
            <Button type="primary" onClick={onClickTable}>
              <TableOutlined /> Tabela
            </Button>
          </TableX.Header.Buttons>
        </TableX.Header.First>
      </TableX.Header.Container>
      <TableX.Container>
        <Calendar
          className="appointments-calendar"
          onPanelChange={(date, mode) => {
            setCurrentMode(mode)
            onChangeDate(date)
          }}
          headerRender={headerRender()}
          fullscreen
          cellRender={(date, info) => {
            if (info.type === 'date') {
              return dayRender(date, dayItems)
            } else {
              return monthRender(date, monthItems)
            }
          }}
          value={date}
          onChange={(date) => onChangeDate(date)}
          onSelect={(date, info) => {
            onChangeDate(date)
            if (info.source === 'month') {
              setCurrentMode('month')
            }
          }}
          mode={currentMode}
        />
      </TableX.Container>
    </>
  )
}

type SelectModeProps = {
  onChange: (value: 'month' | 'year') => void
  value: 'month' | 'year'
}

function SelectMode({ onChange, value }: SelectModeProps) {
  return (
    <Radio.Group
      options={[
        { label: 'Dias', value: 'month' },
        { label: 'Meses', value: 'year' },
      ]}
      onChange={(e) => onChange(e.target.value)}
      value={value}
      optionType="button"
    />
  )
}

type SelectMonthProps = {
  value: number
  onChange: (value: number) => void
}

function SelectMonth({ value, onChange }: SelectMonthProps) {
  return (
    <Select
      className="select-month"
      value={value}
      onChange={(value) => onChange(value)}
      options={[
        { label: 'Janeiro', value: 0 },
        { label: 'Fevereiro', value: 1 },
        { label: 'Março', value: 2 },
        { label: 'Abril', value: 3 },
        { label: 'Maio', value: 4 },
        { label: 'Junho', value: 5 },
        { label: 'Julho', value: 6 },
        { label: 'Agosto', value: 7 },
        { label: 'Setembro', value: 8 },
        { label: 'Outubro', value: 9 },
        { label: 'Novembro', value: 10 },
        { label: 'Dezembro', value: 11 },
      ]}
    />
  )
}

const YearSelectOffset = 10
const YearSelectTotal = 20
type SelectYearProps = {
  value: number
  onChange: (value: number) => void
}

function SelectYear({ value, onChange }: SelectYearProps) {
  const years = Array.from({ length: YearSelectTotal }, (_, i) => value - YearSelectOffset + i)
  return (
    <Select
      className="select-year"
      value={value}
      onChange={(value) => onChange(value)}
      options={years.map((year) => ({ label: year.toString(), value: year }))}
    />
  )
}

type PrevNextButtonsProps = {
  children?: React.ReactNode
  onClickLeft?: () => void
  onClickRight?: () => void
}

function PrevNextButtons({ children, onClickLeft, onClickRight }: PrevNextButtonsProps) {
  return (
    <div>
      {onClickLeft && <Button onClick={onClickLeft} icon={<LeftOutlined />} />}
      {children}
      {onClickRight && <Button onClick={onClickRight} icon={<RightOutlined />} />}
    </div>
  )
}

function headerRender(): CalendarProps<Dayjs>['headerRender'] {
  return (config) => {
    return (
      <div className="appointments-calendar-header">
        {config.type === 'month' && (
          <PrevNextButtons
            onClickLeft={() => config.onChange(config.value.subtract(1, 'month'))}
            onClickRight={() => config.onChange(config.value.add(1, 'month'))}
          >
            <SelectMonth
              onChange={(value) => config.onChange(config.value.set('month', value))}
              value={config.value.get('month')}
            />
          </PrevNextButtons>
        )}
        <PrevNextButtons
          onClickLeft={() => config.onChange(config.value.subtract(1, 'year'))}
          onClickRight={() => config.onChange(config.value.add(1, 'year'))}
        >
          <SelectYear
            onChange={(value) => config.onChange(config.value.set('year', value))}
            value={config.value.get('year')}
          />
        </PrevNextButtons>
        <Button onClick={() => config.onChange(dayjs())}>Hoje</Button>
        <SelectMode onChange={config.onTypeChange} value={config.type} />
      </div>
    )
  }
}

function dayRender(date: dayjs.Dayjs, dayItems: DayListItem[]) {
  const cellItems = dayItems.filter((appointment) => {
    return date.isSame(dayjs(appointment.date), 'date')
  })
  return (
    <ul className="appointments-calendar-list">
      {cellItems.map((item) => (
        <li key={item.id}>
          <Badge status={item.status as any} text={item.description} />
        </li>
      ))}
    </ul>
  )
}

type MonthItemProps = {
  name: string
  count: number
  variant: 'Success' | 'Info' | 'Error'
}

function MonthItem({ name, count, variant }: MonthItemProps) {
  const { token } = theme.useToken()
  return (
    <Tooltip title={`${name}: ${count}`} placement="top">
      <Avatar
        style={
          count === 0
            ? {
                borderColor: 'gray',
                color: 'gray',
                backgroundColor: token.colorWhite,
              }
            : {
                borderColor: token[`color${variant}Text`],
                color: token[`color${variant}Text`],
                backgroundColor: token[`color${variant}Bg`],
              }
        }
        children={count}
      />
    </Tooltip>
  )
}

function monthRender(date: dayjs.Dayjs, monthItems: MonthListItem[]) {
  const currentMonth = date.month()
  const cellMonth = monthItems.find((month) => month.month === currentMonth) ?? {
    month: currentMonth,
    pendingCount: 0,
    realizedCount: 0,
    canceledCount: 0,
  }

  return (
    <Space size="small" className="appointments-calendar-list" style={{ paddingTop: '10px' }}>
      <MonthItem name="Realizados" count={cellMonth.realizedCount} variant="Success" />
      <MonthItem name="Pendentes" count={cellMonth.pendingCount} variant="Info" />
      <MonthItem name="Cancelados" count={cellMonth.canceledCount} variant="Error" />
    </Space>
  )
}

export default CalendarAppointment
