import React from 'react'
import { Card, Text } from '@mantine/core'

const Announcement = () => {
  return (
    <Card p={0} style={{backgroundColor:'black',border:"none",borderRadius:0,color:'white'}}>
        <Text size='xs' p={8} style={{textAlign:'center',fontWeight:400}}>Sign up for our newsletter and get 15% off your next order</Text>
    </Card>
  )
}

export default Announcement