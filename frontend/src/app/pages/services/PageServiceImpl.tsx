import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import type { Service } from '../../../components/app/pages/services/types'
import type { TableServiceProps } from '../../../components/app/pages/services/TableService'

import PageLoading from '../../../components/Loading/PageLoading'
import type { PageMode, ChangePageMode, MoveToPage } from '../../../components/AdminX/types'
import type { ServicesGetAllQuery } from '../../../lib/api'
import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'

import { useServiceQuery, useServicesCountQuery, useServicesListQuery } from '../../../hooks/api/queries/services'
import {
  useServiceCreate,
  useServiceDeleteAll,
  useServiceDelete,
  useServiceUpdate,
} from '../../../hooks/api/mutations/services'
import { useServiceGroups } from '../../../hooks/api/queries/service-groups'
import { useSpecialistListQuery, useSpecialistQuery } from '../../../hooks/api/queries/specialists'

const PageService = lazy(() => import('./PageService'))

type PageServiceImplProps = {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
  moveTo: MoveToPage
}

type ParamsShow = {
  id: string
}
type ParamsList = ServicesGetAllQuery

function PageServiceImpl({ mode, changeMode, moveTo, state }: PageServiceImplProps) {
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [selectedItems, setSelectedItems] = useState<Service[]>([])
  const [previousPageData, setPreviousPageData] = useState<Service[]>([])
  const [record, setRecord] = useState<Service | null>(null)

  function setListQuery(params: ParamsList) {
    setPreviousPageData(queryTable.data ?? [])
    changeMode('list', params)
  }

  const recordQuery = useServiceQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !record,
  })
  useEffect(() => {
    if (!record && recordQuery.data) {
      setRecord(recordQuery.data)
    }
  }, [recordQuery.data, record])

  const queryTable = useServicesListQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const queryCount = useServicesCountQuery({
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
      pageSizeOptions: [10, 20, 50, 100],
      showSizeChanger: true,
      onChange: (page, pageSize) => {
        setListQuery({ ...paramsList, page, pageSize })
      },
    } as TableServiceProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const specialists = useSpecialists(mode, record)

  const queryServices = useServiceGroups({
    enabled: mode === 'create' || mode === 'edit',
  })
  const services = queryServices.data ?? []

  const mutationCreate = useServiceCreate()
  const mutationUpdate = useServiceUpdate()
  const mutationDelete = useServiceDelete()
  const mutationDeleteAll = useServiceDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageService
        data={queryTable.isLoading ? previousPageData : data}
        loading={queryTable.isLoading}
        specialists={specialists}
        services={services}
        total={total}
        pagination={pagination}
        mode={mode}
        changeMode={changeMode}
        record={record}
        changeRecord={setRecord}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        onClickDeleteAll={() => {
          mutationDeleteAll.mutateAsync(selectedItems.map((item) => item.id)).then(() => {
            setSelectedItems([])
          })
        }}
        onClickFilter={(filters) => {
          setListQuery({
            page: 1,
            pageSize: paramsList.pageSize,
            service: filters.service,
            specialization: filters.specialization,
            specialist: filters.specialist,
          })
        }}
        onCreateService={(values) => {
          mutationCreate
            .mutateAsync({
              duration: values.duration,
              price: values.price,
              serviceNameId: values.serviceId,
              specialistId: values.specialistId,
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateService={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate.mutate({
            id: record.id,
            body: {
              duration: values.duration,
              price: values.price,
              serviceNameId: values.serviceId,
              specialistId: values.specialistId,
            },
          })
        }}
        onDeleteService={(record) => {
          mutationDelete.mutate(record.id)
        }}
        onReceateAppointment={() => {
          if (record?.id) {
            sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, JSON.stringify({ serviceId: record.id }))
            moveTo('appointments', { mode: 'create' })
          }
        }}
      />
    </Suspense>
  )
}

const PARAMS_LIST: ParamsList = {
  page: 1,
  pageSize: 20,
  service: '',
  specialist: '',
  specialization: '',
}

function loadParamsList(state: Record<string, string> = {}): ParamsList {
  const params = { ...PARAMS_LIST }
  if (state.page) params.page = parseInt(state.page)
  if (state.pageSize) params.pageSize = parseInt(state.pageSize)
  if (state.service) params.service = state.service
  if (state.specialist) params.specialist = state.specialist
  if (state.specialization) params.specialization = state.specialization
  return params
}

function loadParamsShow(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = { id: '' }
  if (state.id) params.id = state.id
  return params
}

function useSpecialists(mode: PageMode, record: Service | null) {
  const querySpecialistsOnCreate = useSpecialistListQuery({
    params: { page: 1, pageSize: 100 },
    enabled: mode === 'create',
  })
  const querySpecialistsOnUpdate = useSpecialistQuery({
    id: record?.specialistId ?? '',
    enabled: mode === 'edit' && !!record,
  })
  if (mode === 'edit') {
    if (querySpecialistsOnUpdate.data) {
      return [querySpecialistsOnUpdate.data]
    }
    return []
  } else {
    return querySpecialistsOnCreate.data ?? []
  }
}

export default PageServiceImpl
