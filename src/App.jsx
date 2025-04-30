import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import Empleados from './pages/Empleados';
import Equipos from './pages/Equipos';
import Tipos from './pages/Tipos';

function App() {
    return(
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Inicio" element={<Inicio />} />
            <Route path="/Servicios" element={<Servicios />} />
            <Route path="/Clientes" element={<Clientes />} />
            <Route path="/Empleados" element={<Empleados />} />
            <Route path="/Equipos" element={<Equipos />} />
            <Route path="/Tipos" element={<Tipos />} />
        </Routes>        
    );
}

export default App;