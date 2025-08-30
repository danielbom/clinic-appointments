import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import PageLoading from '../../../components/Loading/PageLoading'
import type { ServiceAvailable } from './types'
import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import type { TableServiceAvailableProps } from './TableServiceAvailable'

import { ServiceAvailableGroup, ServiceAvailableGroupItem } from '../../../lib/api'
import { useServiceAvailableQuery, useServicesAvailableGroupQuery } from '../../hooks/queries/services-available'
import {
  useServiceAvailableCreate,
  useServiceAvailableDelete,
  useServiceAvailableDeleteAll,
  useServiceAvailableUpdate,
} from '../../hooks/mutations/services-available'
import { useSpecializationListQuery } from '../../hooks/queries/specializations'

const PageServiceAvailable = lazy(() => import('./PageServiceAvailable'))

type PageServiceAvailableImplProps = {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
}

type ParamsShow = {
  id: string
}

const PARAMS_LIST = { page: 1, pageSize: 20 }

function PageServiceAvailableImpl({ mode, changeMode, state }: PageServiceAvailableImplProps) {
  const [paramsList, setParamsList] = useState(PARAMS_LIST)
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShowFromState(state), [state])
  const [selectedItems, setSelectedItems] = useState<ServiceAvailable[]>([])
  const [record, setRecord] = useState<ServiceAvailable | null>(null)

  const recordQuery = useServiceAvailableQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !record,
  })
  useEffect(() => {
    if (!record) {
      if (recordQuery.data) {
        setRecord({
          id: recordQuery.data.serviceNameId,
          name: recordQuery.data.serviceName,
          specialization: recordQuery.data.specialization,
          specializationId: recordQuery.data.specializationId,
        })
      } else {
        setRecord(null)
      }
    }
  }, [recordQuery.data, record])

  const queryGroup = useServicesAvailableGroupQuery({
    enabled: mode === 'list',
  })
  const groups = queryGroup.data ?? []
  const data = groups.flatMap((group) => group.items.map((item) => mapGroup(group, item)))
  const total = data.length

  const pagination = useMemo(() => {
    return {
      pageSize: paramsList.pageSize,
      current: paramsList.page,
      total: total,
      pageSizeOptions: [10, 20, 50, 100],
      showSizeChanger: true,
      onChange: (page, pageSize) => {
        setParamsList((prev) => ({ ...prev, page, pageSize }))
      },
    } as TableServiceAvailableProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const querySpecializations = useSpecializationListQuery({
    enabled: mode === 'create' || mode === 'edit',
  })
  const specializations = querySpecializations.data ?? []

  const mutationCreate = useServiceAvailableCreate()
  const mutationUpdate = useServiceAvailableUpdate()
  const mutationDelete = useServiceAvailableDelete()
  const mutationDeleteAll = useServiceAvailableDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageServiceAvailable
        data={data}
        total={total}
        pagination={pagination}
        mode={mode}
        changeMode={changeMode}
        record={record}
        changeRecord={setRecord}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        specializations={specializations}
        onClickDeleteAll={() => {
          mutationDeleteAll.mutateAsync(selectedItems.map((item) => item.id)).then(() => {
            setSelectedItems([])
          })
        }}
        onCreateServiceAvailable={(values) => {
          mutationCreate
            .mutateAsync({
              name: values.name,
              specialization: values.specialization,
              specializationId: values.specializationId,
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateServiceAvailable={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate.mutate({
            id: record.id,
            body: { name: values.name },
          })
        }}
        onDeleteServiceAvailable={(record) => {
          mutationDelete.mutate(record.id)
        }}
      />
    </Suspense>
  )
}

function loadParamsShowFromState(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = { id: '' }
  if (state.id) params.id = state.id
  return params
}

function mapGroup(group: ServiceAvailableGroup, item: ServiceAvailableGroupItem): ServiceAvailable {
  return {
    id: item.id,
    name: item.name,
    specializationId: group.id,
    specialization: group.name,
  }
}

export default PageServiceAvailableImpl
