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

function Clientes() {
    document.title = "Clientes | AMM";
    const { user } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const inicialStateForm = {id_cliente: 'NA', nombre_cliente: '', apellido_cliente: '', direccion_cliente: '', telefono_cliente: '', correo_cliente: '', observacion_cliente: '', user_crea: '', user_modifica: '', modificado_el: ''};

    const [clientes, setClientes] = useState([]);
    const [nuevoClient, setNuevoClient] = useState(inicialStateForm);
    const [mostrarModal, setMostrarModal] = useState(false);

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const resClient = await axios.get('http://localhost:3001/clientes');
            setClientes(resClient.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const handleCliente = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_cliente.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const clienteEnc = clientes.find(client => client.id_cliente === parseInt(idSeleccionado));

                if(clienteEnc) {
                    setNuevoClient({
                        id_cliente: clienteEnc.id_tipoLimp,
                        nombre_cliente: clienteEnc.nombre_cliente,
                        apellido_cliente: clienteEnc.apellido_cliente,
                        direccion_cliente: clienteEnc.direccion_cliente,
                        telefono_cliente: clienteEnc.telefono_cliente,
                        correo_cliente: clienteEnc.correo_cliente,
                        observacion_cliente: clienteEnc.observacion_cliente
                    });                    
                };
            } else {
                setMensaje('Código de cliente invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoClient,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['observacion_cliente', 'user_crea'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/clientes/update', datosActualizados);
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
                    ...nuevoClient,
                    user_crea: user.nombre_usuario
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['id_cliente', 'observacion_cliente', 'user_modifica', 'modificado_el'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/clientes/insert', datosActualizados);
                    if (response.data.mensaje) {
                        setMensaje(response.data.mensaje);
                        cargarDatos(); //volver a cargar datos para actualizar
                        setNuevoClient(prev => ({ ...prev, id_cliente: response.data.id}));
                    } else if (response.data.error) {
                        setError(response.data.error);
                    }
                }
            }
        } else if (botonPress === 'mostrar') {
            setMostrarModal(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de cliente invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/clientes/delete', {
                    id_cliente: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoClient(inicialStateForm); //reinicia formulario 
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
                <form className="form_pages" onSubmit={handleCliente}>
                    <div className="form_display">
                        <label htmlFor="id_cliente">Código</label>
                        <select 
                            name="id_cliente"
                            id="id_cliente"
                            value={nuevoClient.id_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, id_cliente: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {clientes.map(client => (
                                <option key={client.id_cliente} value={client.id_cliente}>
                                    {client.id_cliente}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="nombre_cliente">Nombres</label>
                        <input
                            type="text"
                            name="nombre_cliente"
                            id="nombre_cliente"
                            value={nuevoClient.nombre_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, nombre_cliente: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="apellido_cliente">Apellidos</label>
                        <input
                            type="text"
                            name="apellido_cliente"
                            id="apellido_cliente"
                            value={nuevoClient.apellido_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, apellido_cliente: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="direccion_cliente">Dirección</label>
                        <input
                            type="text"
                            name="direccion_cliente"
                            id="direccion_cliente"
                            value={nuevoClient.direccion_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, direccion_cliente: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="telefono_cliente">Telefono</label>
                        <input
                            type="text"
                            name="telefono_cliente"
                            id="telefono_cliente"
                            value={nuevoClient.telefono_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, telefono_cliente: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="correo_cliente">Correo electronico</label>
                        <input
                            type="email"
                            name="correo_cliente"
                            id="correo_cliente"
                            value={nuevoClient.correo_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, correo_cliente: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="observacion_cliente">Observaciones</label>
                        <input
                            type="text"
                            name="observacion_cliente"
                            id="observacion_cliente"
                            value={nuevoClient.observacion_cliente}
                            onChange={(e) => setNuevoClient(nuevoClient => ({ ...nuevoClient, observacion_cliente: e.target.value.trimStart()}))}
                        />
                    </div>
                    <ButtonActions/>
                </form>
            </div>
            {mostrarModal && (
                <ModalTable
                    onClose={() => setMostrarModal(false)}
                    datos={clientes}
                    columnas={[
                        {label: 'Código', field:'id_cliente'}, 
                        {label: 'Nombres', field: 'nombre_cliente'},
                        {label: 'Apellidos', field: 'apellido_cliente'},
                        {label: 'Dirección', field: 'direccion_cliente'},
                        {label: 'Telefono', field: 'telefono_cliente'},
                        {label: 'Correo electronico', field: 'correo_cliente'},
                        {label: 'Observaciones', field: 'observacion_cliente'},
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

export default Clientes;