import { Card, Collapse, DatePicker, Descriptions, Flex, List, Tabs, Timeline, Typography } from 'antd'
import dayjs from 'dayjs'

import type {
  Specialist,
  SpecialistAppointment,
  SpecialistSpecialization,
  SpecialistSpecializationService,
} from './types'

import ShowX from '../../../ShowX'

import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'
import renderDate from '../../../../lib/renders/renderDate'
import renderAge from '../../../../lib/renders/rendertAge'
import renderDuration from '../../../../lib/renders/renderDuration'
import renderMoney from '../../../../lib/renders/renderMoney'

export interface ShowSpecialistProps {
  showTab?: string
  onChangeKey?: (key: string) => void
  onClickEdit: () => void
  onClickDelete: () => void
  record: Specialist | null
  specializations: SpecialistSpecialization[] | null
  referenceDay: string
  onChangeReferenceDay: (referenceDay: string) => void
  appointments: SpecialistAppointment[]
}

function referenceToCount(day: dayjs.Dayjs): string {
  const now = dayjs().startOf('day')
  const countDays = day.diff(now, 'days')
  if (countDays === 0) return `hoje`
  if (countDays === 1) return `amanhã`
  if (countDays === -1) return `ontem`
  if (countDays > 0) return `${countDays} dias à frente`
  if (countDays < 0) return `${countDays * -1} dias atrás`
  return ''
}

function ShowSpecialist({
  showTab,
  onChangeKey,
  onClickDelete,
  onClickEdit,
  record,
  specializations,
  appointments,
  referenceDay,
  onChangeReferenceDay,
}: ShowSpecialistProps) {
  const referenceDayjs = dayjs(referenceDay)

  return (
    <ShowX.Container>
      <Typography.Title level={4}>{record?.name}</Typography.Title>
      <Tabs
        activeKey={showTab}
        onChange={onChangeKey}
        items={[
          {
            key: '1',
            label: 'Informações gerais',
            children: (
              <Card>
                <ShowX.Buttons onClickEdit={onClickEdit} onClickDelete={onClickDelete} />
                {record && (
                  <Descriptions column={1} layout="vertical" size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Nome">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="E-mail">{record.email}</Descriptions.Item>
                    <Descriptions.Item label="CPF">{normalizeCPF(record.cpf)}</Descriptions.Item>
                    <Descriptions.Item label="Telefone">{normalizePhone(record.phone)}</Descriptions.Item>
                    <Descriptions.Item label="Data de Nascimento">{renderDate(record.birthdate)}</Descriptions.Item>
                    <Descriptions.Item label="Idade">{renderAge(record.birthdate)}</Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Especializações e Serviços',
            children: (
              <Card>
                <Collapse
                  items={specializations?.map((specialization) => ({
                    key: specialization.id,
                    label: specialization.name,
                    children: <List bordered dataSource={specialization.services} renderItem={renderServiceItem} />,
                  }))}
                />
              </Card>
            ),
          },
          {
            key: '3',
            label: 'Agenda',
            children: (
              <Card
                title={
                  <Flex gap="2rem" align="center">
                    Agenda do dia
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={referenceDayjs.isValid() ? referenceDayjs : undefined}
                      onChange={(date) => {
                        if (date) onChangeReferenceDay(date.format('YYYY-MM-DD'))
                        else onChangeReferenceDay('')
                      }}
                      allowClear
                    />
                    ({referenceDayjs.isValid() ? referenceToCount(referenceDayjs) : 'não selecionado'})
                  </Flex>
                }
              >
                <Flex align="center" style={{ height: '100%', paddingTop: '2rem' }}>
                  {appointments.length === 0 && <p>Nenhum agendamento para este dia</p>}
                  <Timeline
                    items={appointments.map((it) => {
                      const start = dayjs(it.date.replace('00:00:00', it.time))
                      const end = start.add(it.duration, 'seconds')
                      const day = !referenceDay ? start.format('DD/MM/YYYY') + ', ' : ''
                      const interval = `${start.format('HH:mm')} às ${end.format('HH:mm')}`
                      return {
                        color: referenceDayjs.isAfter(end)
                          ? 'green'
                          : referenceDayjs.isAfter(start)
                            ? 'yellow'
                            : 'blue',
                        children: (
                          <span>
                            <span style={{ paddingRight: '1rem' }}>
                              {day}
                              {interval}
                            </span>{' '}
                            <b>{it.serviceName}</b> ao cliente <b>{it.customerName}</b>
                          </span>
                        ),
                      }
                    })}
                  />
                </Flex>
              </Card>
            ),
          },
        ]}
      />
    </ShowX.Container>
  )
}

function renderServiceItem(item: SpecialistSpecializationService) {
  return (
    <List.Item>
      <List.Item.Meta
        title={item.serviceName}
        description={
          <Flex justify="space-between" wrap>
            <div>Preço: {renderMoney(item.price)}</div>
            <div>Duração: {renderDuration(item.duration)}</div>
          </Flex>
        }
      />
    </List.Item>
  )
}

export default ShowSpecialist
