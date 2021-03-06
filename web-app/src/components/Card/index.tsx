import { Card as AlifdCard } from '@alifd/next'
import * as React from 'react'
import { css, jsx } from '@emotion/core'

const styles = {
  card: {
    display: 'flex',
    width: '100%',
  },
}

interface Props {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

const Card = (props: Props) => (
  <AlifdCard
    showTitleBullet={false}
    contentHeight="auto"
    onClick={props.onClick}
    style={{ ...styles.card, ...props.style }}
  >
    {props.children}
  </AlifdCard>
)

export default Card
