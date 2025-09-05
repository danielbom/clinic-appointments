import './index.css'

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
        {madeByVisible && (
          <span className="app-made-by">
            feito por <u>Farina</u>
          </span>
        )}
      </div>
    </div>
  )
}
