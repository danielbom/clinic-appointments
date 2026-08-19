import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class InvoicesEndpoint {
  constructor(public _config: Config) {}

  async preview(body: InvoicesPreviewBody): Promise<AxiosResponse<InvoicesPreview>> {
    return await this._config.instance.post(`/api/invoices/preview`, body)
  }
}

export type InvoicesPreviewBody = {
  specialistId: string
  startDate: string
  endDate: string
}

export type InvoicesPreview = {}
