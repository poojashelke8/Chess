import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chess_main from './Components/Chess_main'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Chess_main/>
      </div>
    </>
  )
}

export default App
