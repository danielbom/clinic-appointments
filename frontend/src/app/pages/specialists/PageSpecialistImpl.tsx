import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import PageLoading from '../../../components/Loading/PageLoading'
import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import type { SpecialistsGetAllQuery } from '../../../lib/api'
import type { Specialist, SpecialistSpecialization } from './types'
import type { TableSpecialistProps } from './TableSpecialist'

import {
  useSpecialistAppointments,
  useSpecialistCountQuery,
  useSpecialistListQuery,
  useSpecialistQuery,
  useSpecialistServicesQuery,
} from '../../hooks/queries/specialists'
import {
  useSpecialistCreate,
  useSpecialistDeleteAll,
  useSpecialistDelete,
  useSpecialistUpdate,
} from '../../hooks/mutations/specialists'
import { useServiceGroups } from '../../hooks/queries/service-groups'

const PageSpecialist = lazy(() => import('./PageSpecialist'))

type PageSpecialistImplProps = {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
}

type ParamsShow = {
  id: string
  showTab: string
  referenceDay: string
}
type ParamsList = SpecialistsGetAllQuery

function PageSpecialistImpl({ mode, changeMode, state }: PageSpecialistImplProps) {
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [previousData, setPreviousData] = useState<Specialist[]>([])
  const [selectedItems, setSelectedItems] = useState<Specialist[]>([])
  const [specializations, setSpecializations] = useState<SpecialistSpecialization[] | null>(null)
  const [record, setRecord] = useState<Specialist | null>(null)

  function setListQuery(params: ParamsList) {
    setPreviousData(queryTable.data ?? [])
    changeMode('list', params)
  }

  const recordQuery = useSpecialistQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !record,
  })
  useEffect(() => {
    if (!record) {
      setRecord(recordQuery.data ?? null)
    }
  }, [recordQuery.data, record])

  const recordServicesQuery = useSpecialistServicesQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !specializations,
  })
  useEffect(() => {
    if (!specializations) {
      setSpecializations(recordServicesQuery.data ?? null)
    }
  }, [recordServicesQuery.data, specializations])

  const queryTable = useSpecialistListQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const queryCount = useSpecialistCountQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const data = queryTable.data ?? []
  const total = queryCount.data ?? 0

  const pagination = useMemo(() => {
    return {
      pageSize: paramsList.pageSize,
      current: (paramsList.page ?? 0) + 1,
      total: total,
      onChange: (page, pageSize) => {
        setListQuery({ ...paramsList, page: page - 1, pageSize })
      },
    } as TableSpecialistProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const queryAppointments = useSpecialistAppointments({
    id: paramsShow.id,
    date: paramsShow.referenceDay,
    enabled: mode === 'show',
  })

  const queryServices = useServiceGroups({
    enabled: mode === 'create' || mode === 'edit',
  })
  const services = queryServices.data ?? []

  const mutationCreate = useSpecialistCreate()
  const mutationUpdate = useSpecialistUpdate()
  const mutationDelete = useSpecialistDelete()
  const mutationDeleteAll = useSpecialistDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageSpecialist
        data={queryTable.isLoading ? previousData : data}
        loading={queryTable.isLoading}
        total={total}
        services={services}
        record={record}
        changeRecord={setRecord}
        showTab={paramsShow.showTab}
        referenceDay={paramsShow.referenceDay}
        specializations={specializations}
        appointments={queryAppointments.data ?? []}
        pagination={pagination}
        mode={mode}
        changeMode={changeMode}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        onClickDeleteAll={() => {
          mutationDeleteAll.mutateAsync(selectedItems.map((item) => item.id)).then(() => {
            setSelectedItems([])
          })
        }}
        onClickFilter={(filters) => {
          setListQuery({
            ...PARAMS_LIST,
            cpf: filters.cpf?.replace(/\D/g, ''),
            name: filters.name,
            phone: filters.phone?.replace(/\D/g, ''),
          })
        }}
        onCreateRecord={(values) => {
          mutationCreate
            .mutateAsync({
              name: values.name,
              cpf: values.cpf.replace(/\D/g, ''),
              cnpj: values.cnpj.replace(/\D/g, ''),
              email: values.email,
              phone: values.phone.replace(/\D/g, ''),
              birthdate: values.birthdate.format('YYYY-MM-DD'),
              services: values.services.map((service) => ({
                serviceNameId: service.serviceId,
                price: service.price,
                duration: service.duration,
              })),
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateRecord={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate
            .mutateAsync({
              id: record.id,
              body: {
                name: values.name,
                cpf: values.cpf.replace(/\D/g, ''),
                cnpj: values.cnpj.replace(/\D/g, ''),
                email: values.email,
                phone: values.phone.replace(/\D/g, ''),
                birthdate: values.birthdate.format('YYYY-MM-DD'),
                services: values.services.map((service) => ({
                  serviceNameId: service.serviceId,
                  price: service.price,
                  duration: service.duration,
                })),
              },
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onDeleteRecord={(record) => {
          mutationDelete.mutate(record.id)
        }}
      />
    </Suspense>
  )
}

const PARAMS_LIST: ParamsList = {
  page: 1,
  pageSize: 20,
}

function loadParamsList(state: Record<string, string> = {}): ParamsList {
  const params: ParamsList = { ...PARAMS_LIST }
  if (state.page) params.page = parseInt(state.page)
  if (state.pageSize) params.pageSize = parseInt(state.pageSize)
  if (state.cpf) params.cpf = state.cpf
  if (state.name) params.name = state.name
  if (state.phone) params.phone = state.phone
  return params
}

function loadParamsShow(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = {
    id: '',
    showTab: '1',
    referenceDay: '',
  }
  if (state.referenceDay) params.referenceDay = state.referenceDay
  if (state.id) params.id = state.id
  if (state.showTab) params.showTab = state.showTab
  return params
}

export default PageSpecialistImpl
