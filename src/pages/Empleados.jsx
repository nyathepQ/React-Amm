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

    const inicialStateForm = {id_usuario: 'NA', id_tipoUsua: 'NA', nombre_usuario: '', contrasena_usuario: '', id_tipoDocu: 'NA', documento_usuario: '', nombres: '', apellidos: '', telefono_usuario: '', correo_usuario: '', user_crea: '', user_modifica: '', modificado_el: ''};

    const [usuarios, setUsuarios] = useState([]);
    const [tiposUsuario, setTiposUsuario] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState(inicialStateForm);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [datosModal, setDatosModal] = useState([]);

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resUser, resTUs, resTDo] = await Promise.all([
                axios.get('http://localhost:3001/usuarios'),
                axios.get('http://localhost:3001/tipos/usuario'),
                axios.get('http://localhost:3001/tipos/documento')
            ]);
            setUsuarios(resUser.data);
            setTiposUsuario(resTUs.data);
            setTiposDocumento(resTDo.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const createdId = (formulario) => { //función para crear id personalizado
        if(formulario.id_tipoUsua.value === 'NA' || formulario.nombres.value === '' || formulario.apellidos.value === ''){
            return '';
        }

        const tipoUs = tiposUsuario.find(us => us.id_tipoUsua === parseInt(formulario.id_tipoUsua.value));
        
        const tpU = tipoUs.nombre_tipo.substring(0, 3).toUpperCase();
        const nomb = formulario.nombres.value.substring(0, 2).toUpperCase();
        const apell = formulario.apellidos.value.substring(0, 2).toUpperCase();
        const aleatoriNumb = Math.floor(100000 + Math.random() * 900000);

        return `${tpU}${nomb}${apell}${aleatoriNumb}`;
    }

    const handleUsuario = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if(!user || user.id_tipoUsua === 3){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_usuario.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const usuarioEnc = usuarios.find(usua => usua.id_usuario === idSeleccionado);

                if(usuarioEnc) {
                    setNuevoUsuario({
                        id_tipoUsua: usuarioEnc.id_tipoUsua,
                        nombre_usuario: usuarioEnc.nombre_usuario,
                        contrasena_usuario: usuarioEnc.contrasena_usuario,
                        id_tipoDocu: usuarioEnc.id_tipoDocu,
                        documento_usuario: usuarioEnc.documento_usuario,
                        nombres: usuarioEnc.nombres,
                        apellidos: usuarioEnc.apellidos,
                        telefono_usuario: usuarioEnc.telefono_usuario,
                        correo_usuario: usuarioEnc.correo_usuario
                    });                    
                };
            } else {
                setMensaje('Código de usuario invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoUsuario,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['user_crea'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/usuarios/update', datosActualizados);
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
                    ...nuevoUsuario,
                    id_usuario: createdId(form),
                    user_crea: user.nombre_usuario
                };

                // -- Varificar que ningun campo necesario este vacio --
                const camposExcluidos = ['id_usuario', 'user_modifica', 'modificado_el'];
                const camposVacios = Object.entries(datosActualizados).filter(([clave, valor]) => !camposExcluidos.includes(clave) && (valor === '' || valor === 'NA'));

                console.log(camposVacios.map(([clave]) => clave));
                if(camposVacios.length > 0) {
                    setError(`Faltan datos válidos en uno o varios campos`);
                } else {
                    const response = await axios.post('http://localhost:3001/usuarios/insert', datosActualizados);
                    if (response.data.mensaje) {
                        setMensaje(response.data.mensaje);
                        cargarDatos(); //volver a cargar datos para actualizar
                        setNuevoUsuario(prev => ({ ...prev, id_usuario: response.data.id}));
                    } else if (response.data.error) {
                        setError(response.data.error);
                    }
                }                
            }
        } else if (botonPress === 'mostrar') {
            const datosCompletos = usuarios.filter(us => us.id_usuario !== 'NA').map(us => {
                const tipoUsua = tiposUsuario.find(u => u.id_tipoUsua === us.id_tipoUsua);
                const tipoDocu = tiposDocumento.find(u => u.id_tipoDocu === us.id_tipoDocu);
                
                return {
                    ...us,
                    nombre_tipo_usuario: tipoUsua.nombre_tipo,
                    nombre_tipo_documento: tipoDocu.nombre_tipo
                }
            });

            setDatosModal(datosCompletos);
            setMostrarModal(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de usuario invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/usuarios/delete', {
                    id_usuario: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoUsuario(inicialStateForm); //reinicia formulario 
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
                        <label htmlFor="id_usuario">Código</label>
                        <select 
                            name="id_usuario"
                            id="id_usuario"
                            value={nuevoUsuario.id_usuario}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, id_usuario: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {usuarios.map(us => (
                                us.id_usuario !== 'NA' ? (<option key={us.id_usuario} value={us.id_usuario}>{us.id_usuario}</option>) : ''
                            ))}
                        </select>
                        <label htmlFor="id_tipoUsua">Tipo de usuario</label>
                        <select 
                            name="id_tipoUsua"
                            id="id_tipoUsua"
                            value={nuevoUsuario.id_tipoUsua}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, id_tipoUsua: e.target.value}))}
                        >
                            <option key="NA" value="NA">Seleccionar registro</option>
                            {tiposUsuario.map(tUsu => (
                                tUsu.id_tipoUsua !== 'NA' ? (<option key={tUsu.id_tipoUsua} value={tUsu.id_tipoUsua}>{tUsu.nombre_tipo}</option>) : ''
                            ))}
                        </select>
                        <label htmlFor="nombre_usuario">Nombre usuario</label>
                        <input
                            type="text"
                            name="nombre_usuario"
                            id="nombre_usuario"
                            value={nuevoUsuario.nombre_usuario}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, nombre_usuario: e.target.value}))}
                        />
                        <label htmlFor="contrasena_usuario">Contraseña</label>
                        <input
                            type="text"
                            name="contrasena_usuario"
                            id="contrasena_usuario"
                            value={nuevoUsuario.contrasena_usuario}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, contrasena_usuario: e.target.value}))}
                        />
                        <label htmlFor="id_tipoDocu">Documento</label>
                        <DivIdentificacion>
                            <select 
                                name="id_tipoDocu"
                                id="id_tipoDocu"
                                value={nuevoUsuario.id_tipoDocu}
                                onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, id_tipoDocu: e.target.value}))}
                            >
                                <option key="NA" value="NA">Seleccionar registro</option>
                                {tiposDocumento.map(tDoc => (
                                    tDoc.id_tipoDocu !== 'NA' ? (<option key={tDoc.id_tipoDocu} value={tDoc.id_tipoDocu}>{tDoc.nombre_tipo}</option>) : ''
                                ))}
                            </select>
                            <input
                                type="text"
                                name="documento_usuario"
                                id="documento_usuario"
                                value={nuevoUsuario.documento_usuario}
                                onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, documento_usuario: e.target.value}))}
                            />
                        </DivIdentificacion>
                        <label htmlFor="nombres">Nombres</label>
                        <input
                            type="text"
                            name="nombres"
                            id="nombres"
                            value={nuevoUsuario.nombres}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, nombres: e.target.value}))}
                        />
                        <label htmlFor="apellidos">Apellidos</label>
                        <input
                            type="text"
                            name="apellidos"
                            id="apellidos"
                            value={nuevoUsuario.apellidos}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, apellidos: e.target.value}))}
                        />
                        <label htmlFor="telefono_usuario">Telefono</label>
                        <input
                            type="text"
                            name="telefono_usuario"
                            id="telefono_usuario"
                            value={nuevoUsuario.telefono_usuario}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, telefono_usuario: e.target.value}))}
                        />
                        <label htmlFor="correo_usuario">Correo electronico</label>
                        <input
                            type="email"
                            name="correo_usuario"
                            id="correo_usuario"
                            value={nuevoUsuario.correo_usuario}
                            onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, correo_usuario: e.target.value}))}
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
                        {label: 'Código', field:'id_usuario'}, 
                        {label: 'Tipo de usuario', field: 'nombre_tipo_usuario'},
                        {label: 'Nombre usuario', field: 'nombre_usuario'},
                        {label: 'Contraseña', field: 'contrasena_usuario'},
                        {label: 'Tipo de documento', field: 'nombre_tipo_documento'},
                        {label: 'Documento', field: 'documento_usuario'},
                        {label: 'Nombres', field: 'nombres'},
                        {label: 'Apellidos', field: 'apellidos'},
                        {label: 'Telefono', field: 'telefono_usuario'},
                        {label: 'Correo', field: 'correo_usuario'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Usuarios"
                />
            )}
        </PagesDiv>
    </>)
};

export default Empleados;