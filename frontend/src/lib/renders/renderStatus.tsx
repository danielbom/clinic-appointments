import { BadgeProps } from 'antd'
import { AppointmentStatus } from '../api/endpoints/AppointmentsEndpoint'

export default function renderStatus(status: number): BadgeProps['status'] {
  switch (status) {
    case AppointmentStatus.Pending: {
      return 'processing'
    }
    case AppointmentStatus.Realized: {
      return 'success'
    }
    case AppointmentStatus.Canceled: {
      return 'error'
    }
    default: {
      return 'default'
    }
  }
}
