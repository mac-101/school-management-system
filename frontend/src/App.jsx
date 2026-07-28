import { useState, useEffect } from 'react'
import AuthPage from './pages/auth'


function App() {

  useEffect(()=>{
    async function fetchData() {
      console.log(import.meta.env.VITE_API_URL)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}`)
        if (!response.ok) {
          throw new Error('Network')
        }
      } catch (error) {
        
      }
    }
  })

  return (
    <>
    <AuthPage/>
    </>
  )
}

export default App
