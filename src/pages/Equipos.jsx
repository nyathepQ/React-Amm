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
    const [usuariosEquipo, setUsuariosEquipo] = useState([]);
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
            const [resEquipo, resUserEquipo, resEmpleado] = await Promise.all([
                axios.get('http://localhost:3001/equipos'),
                axios.get('http://localhost:3001/equipos/usuarios'),
                axios.get('http://localhost:3001/usuarios')
            ]);
            setEquipos(resEquipo.data);
            setUsuariosEquipo(resUserEquipo.data);
            setEmpleados(resEmpleado.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const handleEquipo = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user || user.id_tipoUsua === 3){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_equipo.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const equipoEnc = equipos.find(equipo => equipo.id_equipo === parseInt(idSeleccionado));
                const miembros = usuariosEquipo.filter(empleados => empleados.id_equipo === parseInt(idSeleccionado));
                
                if(equipoEnc) {
                    setNuevoEquipo({
                        id_equipo: equipoEnc.id_equipo,
                        nombre_equipo: equipoEnc.nombre_equipo,
                        lider: miembros[0].id_usuario,
                        miembro1: miembros[1].id_usuario,
                        miembro2: miembros[2].id_usuario,
                    });                    
                };
            } else {
                setMensaje('Código de equipo invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoEquipo,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                if(datosActualizados.nombre_equipo === '') {
                    return setMensaje('Nombre de equipo no puede estar vacio');
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
                const datosActualizados = {
                    ...nuevoEquipo,
                    user_crea: user.nombre_usuario
                };

                if(datosActualizados.nombre_equipo === '') {
                    return setMensaje('Nombre de equipo no puede estar vacio');
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
                const miembros = usuariosEquipo.filter(u => u.id_equipo === eq.id_equipo);

                const obtenerUsuario = (rol) => {
                    const usuariosEquipo = miembros.find(m => m.rol === rol);
                    if (!usuariosEquipo || usuariosEquipo.id_usuario === 'NA') return {id: null, nombre: 'No asignado'};
                    const usuario = empleados.find(u => u.id_usuario === usuariosEquipo.id_usuario);
                    const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No encontrado';

                    return { id: usuariosEquipo.id_usuario, nombre: nombreCompleto };
                };

                const lider = obtenerUsuario('lider');
                const miembro1 = obtenerUsuario('miembro1');
                const miembro2 = obtenerUsuario('miembro2');

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
                            onChange={(e) => setNuevoEquipo(nuevoEquipo => ({ ...nuevoEquipo, nombre_equipo: e.target.value}))}
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
                                emp.id_usuario !== 'NA' ? (<option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombres} {emp.apellidos}</option>) : ''
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
                                emp.id_usuario !== 'NA' ? (<option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombres} {emp.apellidos}</option>) : ''
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
                                emp.id_usuario !== 'NA' ? (<option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombres} {emp.apellidos}</option>) : ''
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
                    title="Clientes"
                />
            )}
        </PagesDiv>
    </>)
};

export default Equipos;