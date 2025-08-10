import axios from 'axios'

describe.skip('External API E2E - GET requests', () => {
  const BASE_URL = 'https://jsonplaceholder.typicode.com' // example API

  it('should fetch a post by ID', async () => {
    const response = await axios.get(`${BASE_URL}/posts/1`)
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('id', 1)
    expect(response.data).toHaveProperty('title')
  })

  it('should return 404 for a non-existent resource', async () => {
    try {
      await axios.get(`${BASE_URL}/posts/999999`)
    } catch (error: any) {
      expect(error.response.status).toBe(404)
    }
  })
})
