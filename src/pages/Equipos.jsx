import { useState, useEffect } from "react";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { getFechaHoraActual } from '../utils/time';
import ButtonActions from '../components/ButtonActions';
import Header from '../components/Header';
import axios from 'axios';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import ModalTable from '../components/ModalTable';

const Mensaje = styled.p`
    color: ${props => (props.tipo === 'error' ? 'violet' : 'black')};
    text-align: center;
    border: 2px solid ${props => (props.tipo === 'error' ? 'white' : 'black')};
    padding: 10px;
    border-radius: 5px;
    background-color: ${props => (props.tipo === 'mensaje' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
`;

const PagesDiv = styled.div`
    min-height: 80vh;
    margin-top: 5px;
    height: auto;
    width: auto;
    align-self: center;
    align-items: center;
`;

function Equipos() {
    document.title = "Equipos | AMM";
    const { user } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const inicialStateForm = {id_cliente: 'NA', nombre_equipo: '', lider: 'NA', miembro1: 'NA', miembro2: 'NA', user_crea: '', user_modifica: '', modificado_el: ''};

    const [equipos, setEquipos] = useState([]);
    const [empleadosEquipo, setEmpleadosEquipo] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [nuevoEquipo, setNuevoEquipo] = useState(inicialStateForm);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [datosModal, setDatosModal] = useState([]);

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resEquipo, resEmpEquipo, resEmpleado] = await Promise.all([
                axios.get('http://localhost:3001/equipos'),
                axios.get('http://localhost:3001/equipos/empleados'),
                axios.get('http://localhost:3001/empleados')
            ]);
            setEquipos(resEquipo.data);
            setEmpleadosEquipo(resEmpEquipo.data);
            setEmpleados(resEmpleado.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const handleEquipo = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_equipo.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado === "NA"){
                setMensaje('Código de equipo invalido para buscar');
                
            } else {
                const equipoEnc = equipos.find(equipo => equipo.id_equipo === parseInt(idSeleccionado));
                const miembros = empleadosEquipo.filter(empleados => empleados.id_equipo === parseInt(idSeleccionado));
                const lider = miembros.find(emp => emp.rol === 'lider');
                const miembro1 = miembros.find(emp => emp.rol === 'miembro1');
                const miembro2 = miembros.find(emp => emp.rol === 'miembro2');
                
                if(equipoEnc) {
                    setNuevoEquipo({
                        nombre_equipo: equipoEnc.nombre_equipo,
                        lider: lider.id_empleado,
                        miembro1: miembro1.id_empleado,
                        miembro2: miembro2.id_empleado,
                    });                    
                };
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                // comprobar que los campos importantes no esten vacios
                if(nuevoEquipo.nombre_equipo === '') {
                    return setMensaje('Nombre de equipo no puede estar vacio');
                };

                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoEquipo,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };                

                const response = await axios.post('http://localhost:3001/equipos/update', datosActualizados);
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar                    
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            } else {    
                //crear
                // comprobar que los campos importantes no esten vacios
                if(nuevoEquipo.nombre_equipo === '') {
                    return setMensaje('Nombre de equipo no puede estar vacio');
                };

                const datosActualizados = {
                    ...nuevoEquipo,
                    user_crea: user.nombre_usuario
                };                

                const response = await axios.post('http://localhost:3001/equipos/insert', datosActualizados);
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoEquipo(prev => ({ ...prev, id_equipo: response.data.id}));
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        } else if (botonPress === 'mostrar') {
            const datosCompletos = equipos.map(eq => {
                const miembros = empleadosEquipo.filter(u => u.id_equipo === eq.id_equipo);

                const obtenerEmpleado = (rol) => {
                    const empEq = miembros.find(m => m.rol === rol);
                    if (!empEq || empEq.id_empleado === 'NA') return {id: 'NA', nombre: 'No asignado'};
                    const empl = empleados.find(u => u.id_empleado === empEq.id_empleado);
                    const nombreCompleto = empl ? `${empl.nombre_empleado} ${empl.apellido_empleado}` : 'No encontrado';

                    return { id: empEq.id_empleado, nombre: nombreCompleto };
                };

                const lider = obtenerEmpleado('lider');
                const miembro1 = obtenerEmpleado('miembro1');
                const miembro2 = obtenerEmpleado('miembro2');

                return {
                    ...eq,
                    lider: lider.id,
                    lider_nombre: lider.nombre,
                    miembro1: miembro1.id,
                    miembro1_nombre: miembro1.nombre,
                    miembro2: miembro2.id,
                    miembro2_nombre: miembro2.nombre
                }
            });

            setDatosModal(datosCompletos);
            setMostrarModal(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de equipo invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/equipos/delete', {
                    id_equipo: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoEquipo(inicialStateForm); //reinicia formulario 
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        }
    };

    return(<>
        <GlobalStyles />
        <Header />
        <PagesDiv>
            <div>
                {/* Mensajes */}
                {error && <Mensaje tipo="error">{error}</Mensaje>}
                {mensaje && <Mensaje tipo="mensaje">{mensaje}</Mensaje>}
                <form className="form_pages" onSubmit={handleEquipo}>
                    <div className="form_display">
                        <label htmlFor="id_equipo">Código</label>
                        <select 
                            name="id_equipo"
                            id="id_equipo"
                            value={nuevoEquipo.id_equipo}
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, id_equipo: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {equipos.map(eq => (
                                <option key={eq.id_equipo} value={eq.id_equipo}>
                                    {eq.id_equipo}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="nombre_equipo">Nombre equipo</label>
                        <input
                            type="text"
                            name="nombre_equipo"
                            id="nombre_equipo"
                            value={nuevoEquipo.nombre_equipo}
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, nombre_equipo: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="lider">Lider</label>
                        <select 
                            name="lider"
                            id="lider"
                            value={nuevoEquipo.lider}
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, lider: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar empleado</option>
                            {empleados.map(emp => (
                                emp.id_empleado !== 'NA' ? (<option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>) : ''
                            ))}
                        </select>
                        <label htmlFor="miembro1">Miembro</label>
                        <select 
                            name="miembro1"
                            id="miembro1"
                            value={nuevoEquipo.miembro1}
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, miembro1: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar empleado</option>
                            {empleados.map(emp => (
                                emp.id_empleado !== 'NA' ? (<option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>) : ''
                            ))}
                        </select>
                        <label htmlFor="miembro2">Miembro</label>
                        <select 
                            name="miembro2"
                            id="miembro2"
                            value={nuevoEquipo.miembro2}
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, miembro2: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar empleado</option>
                            {empleados.map(emp => (
                                emp.id_empleado !== 'NA' ? (<option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>) : ''
                            ))}
                        </select>
                    </div>
                    <ButtonActions/>
                </form>
            </div>
            {mostrarModal && (
                <ModalTable
                    onClose={() => setMostrarModal(false)}
                    datos={datosModal}
                    columnas={[
                        {label: 'Código', field:'id_equipo'}, 
                        {label: 'Nombre equipo', field: 'nombre_equipo'},
                        {label: 'Lider', field: 'lider_nombre'},
                        {label: 'Miembro 1', field: 'miembro1_nombre'},
                        {label: 'Miembro 2', field: 'miembro2_nombre'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Equipos"
                />
            )}
        </PagesDiv>
    </>)
};

export default Equipos;