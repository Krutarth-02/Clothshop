import { Box, Card, Container, Flex, Heading } from '@chakra-ui/react'
import { Search, ShoppingBag, User } from 'lucide-react'

import React from 'react'
import { Link } from 'react-router'
const Navbar = () => {
  return (
        <Card.Root width={'full'} height={50}>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-around'}>
            <Heading size={"3xl"}>Punita</Heading>
            <Flex gap={2} fontWeight={500}>
                <Link style={{fontSize:14}} to={'/'}>Home</Link>
                <Link style={{fontSize:14}} to={'/shop'}>Shop</Link>
                <Link style={{fontSize:14}} to={'/categories'}>Categories</Link>
                <Link style={{fontSize:14}} to={'/about'}>About</Link>
                <Link style={{fontSize:14}} to={'/review'}>Review</Link>
                <Link style={{fontSize:14}} to={'/faq'}>FAQ</Link>
                <Link style={{fontSize:14}} to={'/journal'}>Journal</Link>
            </Flex>
            <Flex gap={2} fontWeight={500}>
                <User size={18}/>
                <Search size={18}/>
                <ShoppingBag size={18}/>
            </Flex>
        </Box>
        </Card.Root>
  )
}

export default Navbar