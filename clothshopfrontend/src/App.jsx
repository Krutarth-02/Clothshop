import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path='/products' element={<ProductList />} /> */}
        {/* <Route path='/product/:id' element={<Product />} /> */}
        {/* <Route path='/cart' element={<Cart />} /> */}
        {/* <Route path='/login' element={<Login />} /> */}
        {/* <Route path='/register' element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App