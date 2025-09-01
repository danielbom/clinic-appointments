import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import type { Secretary } from './types'

import PageLoading from '../../../components/Loading/PageLoading'
import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import type { SecretariesGetAllQuery } from '../../../lib/api'
import type { TableSecretaryProps } from './TableSecretary'

import { useSecretaryQuery, useSecretariesCountQuery, useSecretariesListQuery } from '../../hooks/queries/secretaries'
import {
  useSecretaryCreate,
  useSecretaryDeleteAll,
  useSecretaryDelete,
  useSecretaryUpdate,
} from '../../hooks/mutations/secretaries'

const PageSecretary = lazy(() => import('./PageSecretary'))

type PageSecretaryImplProps = {
  mode: PageMode
  changeMode: ChangePageMode
  state?: Record<string, string>
}

type ParamsShow = {
  id: string
}
type ParamsList = SecretariesGetAllQuery

const PARAMS_LIST: ParamsList = {
  page: 1,
  pageSize: 20,
}

function PageSecretaryImpl({ mode, changeMode, state }: PageSecretaryImplProps) {
  const paramsList = useMemo<ParamsList>(() => loadParamsList(state), [state])
  const paramsShow = useMemo<ParamsShow>(() => loadParamsShow(state), [state])
  const [previousData, setPreviousData] = useState<Secretary[]>([])
  const [selectedItems, setSelectedItems] = useState<Secretary[]>([])
  const [record, setRecord] = useState<Secretary | null>(null)

  function setListQuery(params: ParamsList) {
    setPreviousData(queryTable.data ?? [])
    changeMode('list', params)
  }

  const recordQuery = useSecretaryQuery({
    id: paramsShow.id,
    enabled: (mode === 'show' || mode === 'edit') && !record,
  })
  useEffect(() => {
    if (!record && recordQuery.data) {
      setRecord(recordQuery.data)
    }
  }, [recordQuery.data, record])

  const queryTable = useSecretariesListQuery({
    params: paramsList,
    enabled: mode === 'list',
  })
  const queryCount = useSecretariesCountQuery({
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
    } as TableSecretaryProps['pagination']
  }, [paramsList.page, paramsList.pageSize, total])

  const mutationCreate = useSecretaryCreate()
  const mutationUpdate = useSecretaryUpdate()
  const mutationDelete = useSecretaryDelete()
  const mutationDeleteAll = useSecretaryDeleteAll()

  return (
    <Suspense fallback={<PageLoading />}>
      <PageSecretary
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
        onCreateSecretary={(values) => {
          mutationCreate
            .mutateAsync({
              name: values.name,
              cpf: values.cpf.replace(/\D/g, ''),
              cnpj: values.cnpj.replace(/\D/g, ''),
              email: values.email,
              phone: values.phone.replace(/\D/g, ''),
              birthdate: values.birthdate.format('YYYY-MM-DD'),
              password: values.password,
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onUpdateSecretary={(values) => {
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
                password: values.password,
              },
            })
            .then(() => {
              changeMode('list')
            })
        }}
        onDeleteSecretary={(record) => {
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

export default PageSecretaryImpl
