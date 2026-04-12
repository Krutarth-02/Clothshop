import React from 'react'
import { Tooltip } from '@mantine/core'

const Tooltipwrapper = ({label,children,arrowOffset=19}) => {
  return (
    <Tooltip label={label} position='top-start' arrowOffset={arrowOffset} withArrow arrowSize={10}>
      {children}
    </Tooltip>
  )
}

export default Tooltipwrapper