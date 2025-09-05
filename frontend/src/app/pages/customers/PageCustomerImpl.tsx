import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import type { Customer } from '../../../components/app/pages/customers/types'
import type { TableCustomerProps } from '../../../components/app/pages/customers/TableCustomer'

import PageLoading from '../../../components/Loading/PageLoading'
import type { ChangePageMode, MoveToPage, PageMode } from '../../../components/AdminX/types'

import type { CustomersGetAllQuery } from '../../../lib/api'
import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'

import { useCustomerQuery, useCustomersCountQuery, useCustomersListQuery } from '../../../hooks/api/queries/customers'
import {
  useCustomerCreate,
  useCustomerDeleteAll,
  useCustomerDelete,
  useCustomerUpdate,
} from '../../../hooks/api/mutations/customers'

const PageCustomer = lazy(() => import('./PageCustomer'))

interface PageCustomerImplProps {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
  moveTo: MoveToPage
}

type ParamsShow = {
  id: string
}
type ParamsList = CustomersGetAllQuery

const PARAMS_LIST: ParamsList = {
  page: 1,
  pageSize: 20,
}

function PageCustomerImpl({ mode, changeMode, moveTo, state }: PageCustomerImplProps) {
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [previousData, setPreviousData] = useState<Customer[]>([])
  const [selectedItems, setSelectedItems] = useState<Customer[]>([])
  const [record, setRecord] = useState<Customer | null>(null)

  function setListQuery(params: ParamsList) {
    setPreviousData(queryTable.data ?? [])
    changeMode('list', params)
  }

  const recordQuery = useCustomerQuery({
    id: paramsShow.id,
    enabled: !record,
  })
  useEffect(() => {
    if (!record && recordQuery.data) {
      setRecord(recordQuery.data)
    }
  }, [recordQuery.data, record])

  const queryTable = useCustomersListQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const queryCount = useCustomersCountQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const data = queryTable.data ?? []
  const total = queryCount.data ?? 0

  const pagination = useMemo(() => {
    return {
      pageSize: paramsList.pageSize,
      current: paramsList.page,
      total: total,
      onChange: (page, pageSize) => {
        setListQuery({ ...paramsList, page, pageSize })
      },
    } as TableCustomerProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const mutationCreate = useCustomerCreate()
  const mutationUpdate = useCustomerUpdate()
  const mutationDelete = useCustomerDelete()
  const mutationDeleteAll = useCustomerDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageCustomer
        data={queryTable.isLoading ? previousData : data}
        loading={queryTable.isLoading}
        total={total}
        pagination={pagination}
        mode={mode}
        changeMode={changeMode}
        selectedItems={selectedItems}
        changeSelectedItems={setSelectedItems}
        record={record}
        changeRecord={setRecord}
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
        onCreateCustomer={(values) => {
          mutationCreate
            .mutateAsync({
              name: values.name,
              cpf: values.cpf.replace(/\D/g, ''),
              email: values.email,
              phone: values.phone.replace(/\D/g, ''),
              birthdate: values.birthdate.format('YYYY-MM-DD'),
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateCustomer={(values) => {
          if (!record) return console.warn('Record is undefined')
          mutationUpdate.mutate({
            id: record.id,
            body: {
              name: values.name,
              cpf: values.cpf.replace(/\D/g, ''),
              email: values.email,
              phone: values.phone.replace(/\D/g, ''),
              birthdate: values.birthdate.format('YYYY-MM-DD'),
            },
          })
        }}
        onDeleteCustomer={(record) => {
          mutationDelete.mutate(record.id)
        }}
        onReceateAppointment={() => {
          if (record?.id) {
            sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, JSON.stringify({ customerId: record.id }))
            moveTo('appointments', { mode: 'create' })
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
  if (state.cpf) params.cpf = state.cpf
  if (state.name) params.name = state.name
  if (state.phone) params.phone = state.phone
  return params
}

function loadParamsShow(state: Record<string, string> = {}): ParamsShow {
  const params: ParamsShow = { id: '' }
  if (state.id) params.id = state.id
  return params
}

export default PageCustomerImpl
