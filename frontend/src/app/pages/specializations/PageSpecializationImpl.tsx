import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import PageLoading from '../../../components/Loading/PageLoading'

import { Specialization } from '../../../components/app/pages/specializations/types'
import { TableSpecializationProps } from '../../../components/app/pages/specializations/TableSpecialization'

import { useServicesAvailableGroupQuery } from '../../../hooks/api/queries/services-available'
import {
  useSpecializationCreate,
  useSpecializationDelete,
  useSpecializationDeleteAll,
  useSpecializationUpdate,
} from '../../../hooks/api/mutations/specializations'

const PageSpecialization = lazy(() => import('./PageSpecialization'))

interface PageSpecializationImplProps {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
}

type ParamsShow = {
  id: string
}
type ParamsList = {
  page: number
  pageSize: number
}

const PARAMS_LIST: ParamsList = {
  page: 1,
  pageSize: 20,
}

function PageSpecializationImpl({ mode, changeMode, state }: PageSpecializationImplProps) {
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [previousData, setPreviousData] = useState<Specialization[]>([])
  const [selectedItems, setSelectedItems] = useState<Specialization[]>([])
  const [record, setRecord] = useState<Specialization | null>(null)

  function setListQuery(params: ParamsList) {
    setPreviousData(data)
    changeMode('list', params)
  }

  const queryTable = useServicesAvailableGroupQuery({
    enabled: true,
  })
  const data = (queryTable.data ?? []).map((item) => ({ id: item.id, name: item.name, services: item.items }))
  const total = data.length

  useEffect(() => {
    if (mode === 'show' || mode === 'edit') {
      if (!record || paramsShow.id !== record.id) {
        const item = data.find((item) => item.id === paramsShow.id)
        setRecord(item ?? null)
      }
    }
  }, [mode, data, record, paramsShow.id])

  const pagination = useMemo(() => {
    return {
      pageSize: paramsList.pageSize,
      current: paramsList.page,
      total: total,
      onChange: (page, pageSize) => {
        setListQuery({ ...paramsList, page, pageSize })
      },
    } as TableSpecializationProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const mutationCreate = useSpecializationCreate()
  const mutationUpdate = useSpecializationUpdate()
  const mutationDelete = useSpecializationDelete()
  const mutationDeleteAll = useSpecializationDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageSpecialization
        data={queryTable.isLoading ? previousData : data}
        loading={queryTable.isLoading}
        total={total}
        mode={mode}
        changeMode={changeMode}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        record={record}
        changeRecord={setRecord}
        pagination={pagination}
        onClickDeleteAll={() => {
          mutationDeleteAll.mutateAsync(selectedItems.map((item) => item.id)).then(() => {
            setSelectedItems([])
          })
        }}
        onCreateSpecialization={(values) => {
          mutationCreate
            .mutateAsync({
              name: values.name,
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateSpecialization={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate
            .mutateAsync({
              id: record.id,
              body: {
                name: values.name,
              },
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onDeleteSpecialization={(record) => {
          mutationDelete.mutate(record.id)
        }}
      />
    </Suspense>
  )
}

function loadParamsList(state: Record<string, string> = {}): ParamsList {
  const params: ParamsList = { ...PARAMS_LIST }
  if (state.page) params.page = parseInt(state.page)
  if (state.pageSize) params.pageSize = parseInt(state.pageSize)
  return params
}

function loadParamsShow(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = { id: '' }
  if (state.id) params.id = state.id
  return params
}

export default PageSpecializationImpl
