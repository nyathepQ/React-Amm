import { useState, useEffect } from "react";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { getFechaHoraActual, calcSumaHoras, formatearFecha } from '../utils/time';
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

function Servicios() {
    document.title = "Servicios | AMM";
    const { user } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const inicialStateForm = {id_servicio: 'NA', id_cliente: 'NA', id_equipo: 'NA', id_tipoLimp: 'NA', fecha: '', hora: '', tiempo_estimado: '', tiempo_finalizacion: '', precio: '', observacion: '', user_crea: '', user_modifica: '', modificado_el: ''};

    const [servicios, setServicios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [tiposLimpieza, setTiposLimpieza] = useState([]);
    const [nuevoServicio, setNuevoServicio] = useState(inicialStateForm);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [datosModal, setDatosModal] = useState([]);

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resServ, resClient, resEquip, resTLimp] = await Promise.all([
                axios.get('http://localhost:3001/servicios'),
                axios.get('http://localhost:3001/clientes'),
                axios.get('http://localhost:3001/equipos'),
                axios.get('http://localhost:3001/tipos/limpieza')
            ]);
            setServicios(resServ.data);
            setClientes(resClient.data);
            setEquipos(resEquip.data);
            setTiposLimpieza(resTLimp.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const handleServicio = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_servicio.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const servicioEnc = servicios.find(usua => usua.id_usuario === idSeleccionado);

                if(servicioEnc) {
                    setNuevoServicio({
                        id_cliente: servicioEnc.id_cliente,
                        id_equipo: servicioEnc.id_equipo,
                        id_tipoLimp: servicioEnc.id_tipoLimp,
                        fecha: servicioEnc.fecha,
                        hora: servicioEnc.hora,
                        tiempo_estimado: servicioEnc.tiempo_estimado,
                        tiempo_finalizacion: servicioEnc.tiempo_finalizacion,
                        precio: servicioEnc.precio,
                        observacion: servicioEnc.observacion
                    });                    
                };
            } else {
                setMensaje('Código de servicio invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoServicio,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['observacion', 'user_crea'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/servicios/update', datosActualizados);
                    if (response.data.mensaje) {
                        setMensaje(response.data.mensaje);
                        cargarDatos(); //volver a cargar datos para actualizar                    
                    } else if (response.data.error) {
                        setError(response.data.error);
                    }
                }
            } else {    
                //crear
                const datosActualizados = {
                    ...nuevoServicio,
                    user_crea: user.nombre_usuario
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['id_servicio', 'observacion', 'user_modifica', 'modificado_el'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/servicios/insert', datosActualizados);
                    if (response.data.mensaje) {
                        setMensaje(response.data.mensaje);
                        cargarDatos(); //volver a cargar datos para actualizar
                        setNuevoServicio(prev => ({ ...prev, id_servicio: response.data.id}));
                    } else if (response.data.error) {
                        setError(response.data.error);
                    }
                }
            }
        } else if (botonPress === 'mostrar') {
            const datosCompletos = servicios.map(serv => {
                const cliente = clientes.find(u => u.id_cliente === serv.id_cliente);
                const equipo = equipos.find(u => u.id_equipo === serv.id_equipo);
                const tipoLimp = tiposLimpieza.find(u => u.id_tipoLimp === serv.id_tipoLimp);
                
                return {
                    ...serv,
                    fecha: formatearFecha(serv.fecha),
                    nombre_cliente: cliente.nombre_cliente + ' ' + cliente.apellido_cliente,
                    nombre_equipo: equipo.nombre_equipo,
                    nombre_tipo_limpieza: tipoLimp.nombre_tipo
                }
            });
            
            setDatosModal(datosCompletos);
            setMostrarModal(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de servicio invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/servicios/delete', {
                    id_servicio: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoServicio(inicialStateForm); //reinicia formulario 
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
                <form className="form_pages" onSubmit={handleServicio}>
                    <div className="form_display">
                        <label htmlFor="id_servicio">Código</label>
                        <select 
                            name="id_servicio"
                            id="id_servicio"
                            value={nuevoServicio.id_servicio}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, id_servicio: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {servicios.map(serv => (
                                <option key={serv.id_servicio} value={serv.id_servicio}>
                                    {serv.id_servicio}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="id_cliente">Cliente</label>
                        <select 
                            name="id_cliente"
                            id="id_cliente"
                            value={nuevoServicio.id_cliente}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, id_cliente: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar registro</option>
                            {clientes.map(cl => (
                                <option key={cl.id_cliente} value={cl.id_cliente}>
                                    {cl.nombre_cliente} {cl.apellido_cliente}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="id_equipo">Equipo</label>
                        <select 
                            name="id_equipo"
                            id="id_equipo"
                            value={nuevoServicio.id_equipo}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, id_equipo: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar registro</option>
                            {equipos.map(eq => (
                                <option key={eq.id_equipo} value={eq.id_equipo}>
                                    {eq.nombre_equipo}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="id_tipoLimp">Limpieza</label>
                        <select 
                            name="id_tipoLimp"
                            id="id_tipoLimp"
                            value={nuevoServicio.id_tipoLimp}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, id_tipoLimp: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar registro</option>
                            {tiposLimpieza.map(tl => (
                                <option key={tl.id_tipoLimp} value={tl.id_tipoLimp}>
                                    {tl.nombre_tipo}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="fecha">Fecha</label>
                        <input
                            type="date"
                            min={new Date().toLocaleDateString('en-CA')} //evita el ingreso de fechas anteriores
                            name="fecha"
                            id="fecha"
                            value={nuevoServicio.fecha}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, fecha: e.target.value}))}
                        />
                        <label htmlFor="hora">Hora</label>
                        <input
                            type="time"
                            name="hora"
                            id="hora"
                            value={nuevoServicio.hora}
                            onChange={(e) => {
                                const nuevaHora = e.target.value;
                                const nuevaFinal = calcSumaHoras(nuevaHora, nuevoServicio.tiempo_estimado || '00:00');
                                setNuevoServicio(nuevoServicio => ({
                                    ...nuevoServicio,
                                    hora: nuevaHora,
                                    tiempo_finalizacion: nuevaFinal
                                }));
                            }}
                        />
                        <label htmlFor="tiempo_estimado">Tiempo de servicio</label>
                        <input
                            type="time"
                            name="tiempo_estimado"
                            id="tiempo_estimado"
                            value={nuevoServicio.tiempo_estimado}
                            onChange={(e) => {
                                const nuevoTiempo = e.target.value;
                                const nuevaFinal = calcSumaHoras(nuevoServicio.hora || '00:00', nuevoTiempo);
                                setNuevoServicio(nuevoServicio => ({
                                    ...nuevoServicio,
                                    tiempo_estimado: nuevoTiempo,
                                    tiempo_finalizacion: nuevaFinal
                                }));
                            }}
                        />
                        <label htmlFor="tiempo_finalizacion">Hora de finalización</label>
                        <input
                            type="time"
                            name="tiempo_finalizacion"
                            id="tiempo_finalizacion"
                            value={nuevoServicio.tiempo_finalizacion}
                            disabled
                        />
                        <label htmlFor="precio">Valor</label>
                        <input
                            type="number"
                            min="0" // valor minimo aceptado
                            step="0.01" // acepta valores decimales
                            name="precio"
                            id="precio"
                            value={nuevoServicio.precio}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, precio: e.target.value}))}
                        />
                        <label htmlFor="observacion">Observaciones</label>
                        <input
                            type="text"
                            name="observacion"
                            id="observacion"
                            value={nuevoServicio.observacion}
                            onChange={(e) => setNuevoServicio(nuevoServicio => ({ ...nuevoServicio, observacion: e.target.value}))}
                        />
                    </div>
                    <ButtonActions/>
                </form>
            </div>
            {mostrarModal && (
                <ModalTable
                    onClose={() => setMostrarModal(false)}
                    datos={datosModal}
                    columnas={[
                        {label: 'Código', field:'id_servicio'}, 
                        {label: 'Cliente', field: 'nombre_cliente'},
                        {label: 'Equipo', field: 'nombre_equipo'},
                        {label: 'Limpieza', field: 'nombre_tipo_limpieza'},
                        {label: 'Fecha', field: 'fecha'},
                        {label: 'Hora', field: 'hora'},
                        {label: 'Tiempo de servicio', field: 'tiempo_estimado'},
                        {label: 'Finalización', field: 'tiempo_finalizacion'},
                        {label: 'Valor', field: 'precio'},
                        {label: 'Observació', field: 'observacion'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Servicios"
                />
            )}
        </PagesDiv>
    </>)
};

export default Servicios;