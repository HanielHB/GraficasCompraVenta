import { useState } from "react"


const App = () => {
  const [nombre, setNombre] = useState('');
  return (
    <div>
      <h1>Hello world</h1>
      <div>
        <input onChange={(e) => {
          setNombre(e.target.value);
        }} type="text" placeholder="Ingrese su nombre..." />
      </div>
      <div>Mi nombre es: {nombre}</div>
    </div>
  )
}

export default App
