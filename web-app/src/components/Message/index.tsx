import { Message as AlifdMessage } from '@alifd/next'
import * as React from 'react'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'notice' | 'help' | 'loading'
  shape?: 'inline' | 'addon' | 'toast'
  size?: 'medium' | 'large'
  title: string
  content?: string
  closed?: boolean
  closeable?: boolean
  onClose?: () => void
  handleClose?: () => void
}

const Message = (props: Props) => {
  const [visible, setVisible] = React.useState(true)
  function onClose() {
    if (props.onClose) {
      props.onClose()
    }
    setVisible(false)
  }
  return (
    <AlifdMessage
      type={props.type}
      visible={props.closed ? !props.closed : visible}
      title={props.title}
      closeable={props.closeable}
      onClose={onClose}
      shape={props.shape}
    >
      {props.content}
    </AlifdMessage>
  )
}

export default Message
