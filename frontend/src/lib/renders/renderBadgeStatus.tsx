import { Tag } from 'antd'
import { AppointmentStatus } from '../api/endpoints/AppointmentsEndpoint'

export default function renderTagStatus(status: number) {
  switch (status) {
    case AppointmentStatus.Pending: {
      return <Tag style={{ margin: 0 }} color="processing" children="PEN" />
    }
    case AppointmentStatus.Realized: {
      return <Tag style={{ margin: 0 }} color="success" children="OK" />
    }
    case AppointmentStatus.Canceled: {
      return <Tag style={{ margin: 0 }} color="error" children="CAN" />
    }
    default: {
      return <Tag style={{ margin: 0 }} color="default" children="?" />
    }
  }
}
