import React from 'react'
import { Container } from '@mui/material'

import Header from "./header"
import Body from "./body"
import Footer from "./footer"


const CalculationPage: React.FC = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Header />
      <Body />
      <Footer />
    </Container>
  )
}

export default CalculationPage

