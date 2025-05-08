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

const DivIdentificacion = styled.div`
    display: grid;
    gap: 5px;
    grid-template-columns: 25% 75%;
`;

function Empleados() {
    document.title = "Empleados | AMM";
    const { user } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const inicialStateForm = {id_empleado: 'NA', id_tipoDocu: 'NA', documento_empleado: '', nombre_empleado: '', apellido_empleado: '', telefono_empleado: '', correo_empleado: '', user_crea: '', user_modifica: '', modificado_el: ''};

    const [empleados, setEmpleados] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [nuevoEmpleado, setNuevoEmpleado] = useState(inicialStateForm);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [datosModal, setDatosModal] = useState([]);

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resEmp, resTDo] = await Promise.all([
                axios.get('http://localhost:3001/empleados'),
                axios.get('http://localhost:3001/tipos/documento')
            ]);
            setEmpleados(resEmp.data);
            setTiposDocumento(resTDo.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const createdId = (formulario) => { //función para crear id personalizado
        if(formulario.nombre_empleado.value === '' || formulario.apellido_empleado.value === ''){
            return '';
        }

        const nomb = formulario.nombre_empleado.value.substring(0, 3).toUpperCase();
        const apell = formulario.apellido_empleado.value.substring(0, 3).toUpperCase();
        const aleatoriNumb = Math.floor(10000 + Math.random() * 90000);

        return `EMP-${nomb}${apell}${aleatoriNumb}`;
    }

    const handleUsuario = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_empleado.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const usuarioEnc = empleados.find(emp => emp.id_empleado === idSeleccionado);

                if(usuarioEnc) {
                    setNuevoEmpleado({
                        id_tipoDocu: usuarioEnc.id_tipoDocu,
                        documento_empleado: usuarioEnc.documento_empleado,
                        nombre_empleado: usuarioEnc.nombre_empleado,
                        apellido_empleado: usuarioEnc.apellido_empleado,
                        telefono_empleado: usuarioEnc.telefono_empleado,
                        correo_empleado: usuarioEnc.correo_empleado
                    });                    
                };
            } else {
                setMensaje('Código de empleado invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoEmpleado,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['user_crea'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/empleados/update', datosActualizados);
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
                    ...nuevoEmpleado,
                    id_empleado: createdId(form),
                    user_crea: user.nombre_usuario
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['id_usuario', 'user_modifica', 'modificado_el'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/empleados/insert', datosActualizados);
                    if (response.data.mensaje) {
                        setMensaje(response.data.mensaje);
                        cargarDatos(); //volver a cargar datos para actualizar
                        setNuevoEmpleado(prev => ({ ...prev, id_empleado: response.data.id}));
                    } else if (response.data.error) {
                        setError(response.data.error);
                    }
                }                
            }
        } else if (botonPress === 'mostrar') {
            const datosCompletos = empleados.filter(emp => emp.id_empleado !== 'NA').map(emp => {
                const tipoDocu = tiposDocumento.find(u => u.id_tipoDocu === emp.id_tipoDocu);
                
                return {
                    ...emp,
                    nombre_tipo_documento: tipoDocu.nombre_tipo
                }
            });

            setDatosModal(datosCompletos);
            setMostrarModal(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de empleado invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/empleados/delete', {
                    id_empleado: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoEmpleado(inicialStateForm); //reinicia formulario 
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
                <form className="form_pages" onSubmit={handleUsuario}>
                    <div className="form_display">
                        <label htmlFor="id_empleado">Código</label>
                        <select 
                            name="id_empleado"
                            id="id_empleado"
                            value={nuevoEmpleado.id_empleado}
                            onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, id_empleado: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {empleados.map(emp => (
                                emp.id_empleado !== 'NA' ? (<option key={emp.id_empleado} value={emp.id_empleado}>{emp.id_empleado}</option>) : ''
                            ))}
                        </select>
                        <label htmlFor="id_tipoDocu">Documento</label>
                        <DivIdentificacion>
                            <select 
                                name="id_tipoDocu"
                                id="id_tipoDocu"
                                value={nuevoEmpleado.id_tipoDocu}
                                onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, id_tipoDocu: e.target.value}))}
                            >
                                <option key="NA" value="NA">Seleccionar registro</option>
                                {tiposDocumento.map(tDoc => (
                                    tDoc.id_tipoDocu !== 'NA' ? (<option key={tDoc.id_tipoDocu} value={tDoc.id_tipoDocu}>{tDoc.nombre_tipo}</option>) : ''
                                ))}
                            </select>
                            <input
                                type="text"
                                name="documento_empleado"
                                id="documento_empleado"
                                value={nuevoEmpleado.documento_empleado}
                                onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, documento_empleado: e.target.value.trimStart()}))}
                            />
                        </DivIdentificacion>
                        <label htmlFor="nombre_empleado">Nombres</label>
                        <input
                            type="text"
                            name="nombre_empleado"
                            id="nombre_empleado"
                            value={nuevoEmpleado.nombre_empleado}
                            onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, nombre_empleado: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="apellido_empleado">Apellidos</label>
                        <input
                            type="text"
                            name="apellido_empleado"
                            id="apellido_empleado"
                            value={nuevoEmpleado.apellido_empleado}
                            onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, apellido_empleado: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="telefono_empleado">Telefono</label>
                        <input
                            type="text"
                            name="telefono_empleado"
                            id="telefono_empleado"
                            value={nuevoEmpleado.telefono_empleado}
                            onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, telefono_empleado: e.target.value.trimStart()}))}
                        />
                        <label htmlFor="correo_empleado">Correo electronico</label>
                        <input
                            type="email"
                            name="correo_empleado"
                            id="correo_empleado"
                            value={nuevoEmpleado.correo_empleado}
                            onChange={(e) => setNuevoEmpleado(nuevoEmpleado => ({ ...nuevoEmpleado, correo_empleado: e.target.value.trimStart()}))}
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
                        {label: 'Código', field:'id_empleado'}, 
                        {label: 'Tipo de documento', field: 'nombre_tipo_documento'},
                        {label: 'Documento', field: 'documento_empleado'},
                        {label: 'Nombres', field: 'nombre_empleado'},
                        {label: 'Apellidos', field: 'apellido_empleado'},
                        {label: 'Telefono', field: 'telefono_empleado'},
                        {label: 'Correo', field: 'correo_empleado'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Empleados"
                />
            )}
        </PagesDiv>
    </>)
};

export default Empleados;