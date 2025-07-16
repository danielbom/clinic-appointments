import { Flex, Spin } from 'antd'

function PageLoading() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Spin size="large" />
    </Flex>
  )
}

export default PageLoading
