import './index.css'

import AppMadeBy from '../AppMadeBy'

interface AppLogoProps {
  madeByVisible?: boolean
}

export default function AppLogo({ madeByVisible }: AppLogoProps) {
  return (
    <div className="app-logo">
      <div className="app-logo-center">
        <span>
          <b className="app-initial">AS</b>
          <br />
          <b className="app-name">Agenda de Serviços</b>
        </span>
        {madeByVisible && <AppMadeBy />}
      </div>
    </div>
  )
}
