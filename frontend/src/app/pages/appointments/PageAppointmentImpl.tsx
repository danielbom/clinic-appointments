import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { message } from 'antd'

import type { Appointment } from './types'
import type { TableAppointmentProps } from './TableAppointment'

import PageLoading from '../../../components/Loading/PageLoading'
import type { ChangePageMode, MoveToPage, PageMode } from '../../../components/AdminX/types'
import type { AppointmentsGetAllQuery, CustomersGetAllQuery, ServicesGetAllQuery } from '../../../lib/api'
import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'

import {
  useAppointmentQuery,
  useAppointmentsCountQuery,
  useAppointmentsListQuery,
} from '../../hooks/queries/appointments'
import {
  useAppointmentsCreate,
  useAppointmentsDeleteAll,
  useAppointmentsDelete,
  useAppointmentsUpdate,
} from '../../hooks/mutations/appointments'
import { useCustomersListQuery } from '../../hooks/queries/customers'
import { useServicesListQuery } from '../../hooks/queries/services'
import { useApi } from '../../../context/ApiContext'

const PageAppointment = lazy(() => import('./PageAppointment'))

type PageAppointmentImplProps = {
  mode: PageMode
  changeMode: ChangePageMode
  state: Record<string, string>
  moveTo: MoveToPage
}

type ParamsShow = {
  id: string
}
type ParamsList = AppointmentsGetAllQuery

const PARAMS_LIST: AppointmentsGetAllQuery = {
  page: 1,
  pageSize: 20,
}
const PARAMS_SERVICE: ServicesGetAllQuery = {
  page: 1,
  pageSize: 5,
}
const PARAMS_CUSTOMER: ServicesGetAllQuery = {
  page: 1,
  pageSize: 5,
}

function PageAppointmentImpl({ mode, changeMode, moveTo, state }: PageAppointmentImplProps) {
  const api = useApi()
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [previousData, setPreviousData] = useState<Appointment[]>([])
  const [paramsSearchService, setParamsSearchService] = useState<ServicesGetAllQuery>(PARAMS_SERVICE)
  const [paramsSearchCustomers, setParamsSearchCustomer] = useState<CustomersGetAllQuery>(PARAMS_CUSTOMER)
  const [selectedItems, setSelectedItems] = useState<Appointment[]>([])
  const [record, setRecord] = useState<Appointment | null>(null)

  function setListQuery(newQuery: ParamsList) {
    setPreviousData(queryTable.data ?? [])
    changeMode('list', newQuery)
  }

  const recordQuery = useAppointmentQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !record,
  })
  useEffect(() => {
    if (!record && recordQuery.data) {
      setRecord(recordQuery.data)
    }
  }, [recordQuery.data, record])

  const queryTable = useAppointmentsListQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const queryTableCount = useAppointmentsCountQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const data = queryTable.data ?? []
  const total = queryTableCount.data ?? 0

  const pagination = useMemo(() => {
    return {
      pageSize: paramsList.pageSize,
      current: paramsList.page,
      total: total,
      onChange: (page, pageSize) => {
        setListQuery({ ...paramsList, page, pageSize })
      },
    } as TableAppointmentProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const querySearchServices = useServicesListQuery({
    params: paramsSearchService,
    enabled: mode === 'create',
  })
  const querySearchCustomers = useCustomersListQuery({
    params: paramsSearchCustomers,
    enabled: mode === 'create',
  })
  const services = querySearchServices.data ?? []
  const customers = querySearchCustomers.data ?? []

  const mutationCreate = useAppointmentsCreate()
  const mutationUpdate = useAppointmentsUpdate()
  const mutationDelete = useAppointmentsDelete()
  const mutationDeleteAll = useAppointmentsDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageAppointment
        view={state.view as any}
        data={queryTable.isLoading ? previousData : data}
        total={total}
        pagination={pagination}
        mode={mode}
        changeMode={changeMode}
        record={record}
        changeRecord={setRecord}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        customers={customers}
        services={services}
        onClickDeleteAll={() => {
          mutationDeleteAll.mutateAsync(selectedItems.map((item) => item.id)).then(() => {
            setSelectedItems([])
          })
        }}
        onClickFilterCustomer={(filters) => {
          setParamsSearchCustomer({
            page: 1,
            pageSize: paramsSearchCustomers.pageSize,
            cpf: filters.cpf?.replace(/\D/g, ''),
            name: filters.name,
            phone: filters.phone?.replace(/\D/g, ''),
          })
        }}
        onClickFilterService={(filters) => {
          setParamsSearchService({
            page: 1,
            pageSize: paramsSearchService.pageSize,
            service: filters.service,
            specialization: filters.specialization,
            specialist: filters.specialist,
          })
        }}
        onClickFilter={(filters) => {
          setListQuery({
            page: 1,
            pageSize: paramsList.pageSize,
            customer: filters.customer,
            serviceName: filters.serviceName,
            specialist: filters.specialist,
            startDate: filters.dateInterval?.[0]?.format('YYYY-MM-DD'),
            endDate: filters.dateInterval?.[1]?.format('YYYY-MM-DD'),
            status: filters.status,
          })
        }}
        onCreateAppointment={(values) => {
          mutationCreate
            .mutateAsync({
              customerId: values.customerId,
              serviceId: values.serviceId,
              time: values.time.format('hh:mm:ss'),
              date: values.date.format('YYYY-MM-DD'),
            })
            .then(() => {
              changeMode('list')
              setParamsSearchCustomer(PARAMS_CUSTOMER)
              setParamsSearchService(PARAMS_SERVICE)
            })
        }}
        onUpdateAppointment={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate
            .mutateAsync({
              id: record.id,
              data: {
                time: values.time.format('hh:mm:ss'),
                date: values.date.format('YYYY-MM-DD'),
                status: values.status,
              },
            })
            .then(() => {
              changeMode('list')
              setParamsSearchCustomer(PARAMS_CUSTOMER)
              setParamsSearchService(PARAMS_SERVICE)
            })
        }}
        onDeleteAppointment={(record) => {
          mutationDelete.mutate(record.id)
        }}
        onRecreateAppointment={async () => {
          if (record?.id) {
            try {
              const service = await api.specialists.getService(record.specialistId, record.serviceNameId)
              const data = JSON.stringify({
                customerId: record.customerId,
                time: record.time,
                serviceId: service.data.id,
              })
              sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, data)
              moveTo('appointments', { mode: 'create' })
            } catch (error) {
              message.error('Serviço deste especialista está indisponível')
            }
          }
        }}
      />
    </Suspense>
  )
}

function loadParamsList(state: Record<string, string> = {}): ParamsList {
  const params: ParamsList = { ...PARAMS_LIST }
  if (state.page) params.page = parseInt(state.page)
  if (state.pageSize) params.pageSize = parseInt(state.pageSize)
  if (state.startDate) params.startDate = state.startDate
  if (state.endDate) params.endDate = state.endDate
  if (state.serviceName) params.serviceName = state.serviceName
  if (state.specialist) params.specialist = state.specialist
  if (state.customer) params.customer = state.customer
  return params
}

function loadParamsShow(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = { id: '' }
  if (state.id) params.id = state.id
  return params
}

export default PageAppointmentImpl
