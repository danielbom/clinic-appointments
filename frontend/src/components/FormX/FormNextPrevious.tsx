import { Flex, Button } from 'antd'
import './FormNextPrevious.css'

export interface FormNextPreviousProps {
  previousDisabled?: boolean
  nextDisabled?: boolean
  onClickPrevious?: () => void
  onClickNext?: () => void
  nextText?: string
}

export default function FormNextPrevious({
  previousDisabled,
  nextDisabled,
  onClickPrevious,
  onClickNext,
  nextText = 'Próximo',
}: FormNextPreviousProps) {
  return (
    <Flex justify="space-between" className="form-next-previous">
      <Button type="primary" disabled={nextDisabled} onClick={onClickNext}>
        {nextText}
      </Button>
      <Button type="default" disabled={previousDisabled} onClick={onClickPrevious}>
        Anterior
      </Button>
    </Flex>
  )
}
