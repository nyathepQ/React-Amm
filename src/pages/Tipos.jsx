import { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';
import { getFechaHoraActual } from '../utils/time';
import ButtonActions from '../components/ButtonActions';
import Header from '../components/Header';
import axios from 'axios';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import ModalTable from '../components/ModalTable';

const PagesDiv = styled.div`
    min-height: 80vh;
    margin-top: 5px;
    height: auto;
    width: auto;
    align-self: center;
    align-items: center;
`;

const FormTipoUsuario = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Mensaje = styled.p`
    color: ${props => (props.tipo === 'error' ? 'darkred' : 'black')}
    text-align: center;
    border: 2px solid ${props => (props.tipo === 'error' ? 'white' : 'black')};
    padding: 10px;
    border-radius: 5px;
    background-color: ${props => (props.tipo == 'mensaje' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
`;

function Tipos() {
    document.title = "Tipos | AMM";
    const { user } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [tiposLimpieza, setTiposLimpieza] = useState([]);
    const [tiposUsuario, setTiposUsuario] = useState([]);

    const [nuevoDoc, setNuevoDoc] = useState({ id_tipoDocu: '', nombre_tipo: '', user_modifica: '', modificado_el: ''});
    const [nuevaLimp, setNuevaLimp] = useState({id_tipoLimp: '', nombre_tipo: '', user_modifica: '', modificado_el: ''});
    const [mostrarModalDoc, setMostrarModalDoc] = useState(false);
    const [mostrarModalLimp, setMostrarModalLimp] = useState(false);
    const [mostrarModalTUs, setMostrarModalTUs] = useState(false);

    // cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resDoc, resLimp, resUsua] = await Promise.all([
                axios.get('http://localhost:3001/tipos/documento'),
                axios.get('http://localhost:3001/tipos/limpieza'),
                axios.get('http://localhost:3001/tipos/usuario')
            ]);
            setTiposDocumento(resDoc.data);
            setTiposLimpieza(resLimp.data);
            setTiposUsuario(resUsua.data);
        } catch (error) {
            console.error('Error en la carga de datos: ', error);
        }
    };

    const handleTipoDocu = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        
        if(!user || user.id_tipoUsua === 3){
            navigate('/');  
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_tipoDocu.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const tipoDocuEnc = tiposDocumento.find(docu => docu.id_tipoDocu === parseInt(idSeleccionado));

                if(tipoDocuEnc) {
                    setNuevoDoc({
                        id_tipoDocu: tipoDocuEnc.id_tipoDocu,
                        nombre_tipo: tipoDocuEnc.nombre_tipo
                    });                    
                };
            } else {
                setMensaje('Código de tipo de documento invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevoDoc,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                const response = await axios.post('http://localhost:3001/tipos/documento/update', datosActualizados);
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar                    
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            } else {    
                //crear
                const response = await axios.post('http://localhost:3001/tipos/documento/insert', {
                    nombre_tipo: nuevoDoc.nombre_tipo,
                    user_crea: user.nombre_usuario
                });
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoDoc(prev => ({ ...prev, id_tipoDocu: response.data.id}));
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        } else if (botonPress === 'mostrar') {
            setMostrarModalDoc(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de tipo de documento invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/tipos/documento/delete', {
                    id_tipoDocu: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevoDoc({ id_tipoDocu: 'NA', nombre_tipo: '', user_modifica: '', modificado_el: '' }); //reinicia formulario 
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        }
    };

    const handleTipoLimp = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if(!user || user.id_tipoUsua === 3){
            navigate('/');
        }

        const botonPress = e.nativeEvent.submitter.name;
        const form = e.target;
        const idSeleccionado = form.id_tipoLimp.value;

        if(botonPress === 'buscar') {
            if(idSeleccionado !== "NA"){
                const tipoLimpEnc = tiposLimpieza.find(limp => limp.id_tipoLimp === parseInt(idSeleccionado));

                if(tipoLimpEnc) {
                    setNuevaLimp({
                        id_tipoLimp: tipoLimpEnc.id_tipoLimp,
                        nombre_tipo: tipoLimpEnc.nombre_tipo
                    });                    
                };
            } else {
                setMensaje('Código de tipo de limpieza invalido para buscar');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                const modFecha = getFechaHoraActual();
                const datosActualizados = {
                    ...nuevaLimp,
                    user_modifica: user.nombre_usuario,
                    modificado_el: modFecha
                };

                const response = await axios.post('http://localhost:3001/tipos/limpieza/update', datosActualizados);
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar                    
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            } else {    
                //crear
                const response = await axios.post('http://localhost:3001/tipos/limpieza/insert', {
                    nombre_tipo: nuevaLimp.nombre_tipo,
                    user_crea: user.nombre_usuario
                });
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevaLimp(prev => ({ ...prev, id_tipoLimp: response.data.id}));
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        } else if (botonPress === 'mostrar') {
            setMostrarModalLimp(true);
        } else if (botonPress === 'eliminar') {
            if(idSeleccionado === 'NA') {
                setMensaje('Código de tipo de limpieza invalido para eliminar');
            } else {
                const response = await axios.post('http://localhost:3001/tipos/limpieza/delete', {
                    id_tipoLimp: idSeleccionado
                });
                if(response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    cargarDatos(); //volver a cargar datos para actualizar
                    setNuevaLimp({ id_tipoLimp: 'NA', nombre_tipo: '', user_modifica: '', modificado_el: '' }); //reinicia formulario 
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            }
        }
    };

    const handleTipoUsua = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        const botonPress = e.nativeEvent.submitter.name;

        if(botonPress === 'mostrar') {
            setMostrarModalTUs(true);
        }
    }


    return(<>
        <GlobalStyles/>
        <Header/>
        <PagesDiv>
            <div>
                {/* Mensajes */}
                {error && <Mensaje tipo="error">{error}</Mensaje>}
                {mensaje && <Mensaje tipo="mensaje">{mensaje}</Mensaje>}
                <form className="form_pages" onSubmit={handleTipoDocu}>
                    <h2>Tipo de Documento</h2>
                    <div className="form_display">
                        <label htmlFor="id_tipoDocu">Código</label>
                        <select 
                            name="id_tipoDocu"
                            id="id_tipoDocu"
                            value={nuevoDoc.id_tipoDocu}
                            onChange={(e) => setNuevoDoc(nuevoDoc => ({ ...nuevoDoc, id_tipoDocu: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {tiposDocumento.map(docu => (
                                <option key={docu.id_tipoDocu} value={docu.id_tipoDocu}>
                                    {docu.id_tipoDocu}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="nombre_tipo">Nombre</label>
                        <input
                            type="text"
                            name="nombre_tipo"
                            id="nombre_tipo"
                            value={nuevoDoc.nombre_tipo}
                            onChange={(e) => setNuevoDoc(nuevoDoc => ({ ...nuevoDoc, nombre_tipo: e.target.value}))}
                        />
                    </div>
                    <ButtonActions/>
                </form>
            </div>
            <div>
            <form className="form_pages" onSubmit={handleTipoLimp}>
                    <h2>Tipo de Limpieza</h2>
                    <div className="form_display">
                        <label htmlFor="id_tipoLimp">Código</label>
                        <select 
                            name="id_tipoLimp"
                            id="id_tipoLimp"
                            value={nuevaLimp.id_tipoLimp}
                            onChange={(e) => setNuevaLimp(nuevaLimp => ({ ...nuevaLimp, id_tipoLimp: e.target.value}))}
                        >
                            <option key="NA" value="NA">Nuevo registro</option>
                            {tiposLimpieza.map(limp => (
                                <option key={limp.id_tipoLimp} value={limp.id_tipoLimp}>
                                    {limp.id_tipoLimp}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="nombre_tipo">Nombre</label>
                        <input
                            type="text"
                            name="nombre_tipo"
                            id="nombre_tipo"
                            value={nuevaLimp.nombre_tipo}
                            onChange={(e) => setNuevaLimp(nuevaLimp => ({ ...nuevaLimp, nombre_tipo: e.target.value}))}
                        />
                    </div>
                    <ButtonActions/>                    
                </form>
            </div>
            <FormTipoUsuario>
                <form className="form_pages" onSubmit={handleTipoUsua}>
                    <h2>Tipo de Usuario</h2>
                    <div>
                        <button key="mostrar" type="submit" name="mostrar">Mostrar registros</button>
                    </div>
                </form>
            </FormTipoUsuario>
            {mostrarModalDoc && (
                <ModalTable
                    onClose={() => setMostrarModalDoc(false)}
                    datos={tiposDocumento}
                    columnas={[
                        {label: 'Código', field:'id_tipoDocu'}, 
                        {label: 'Nombre', field: 'nombre_tipo'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Tipos de Documento"
                />
            )}
            {mostrarModalLimp && (
                <ModalTable
                    onClose={() => setMostrarModalLimp(false)}
                    datos={tiposLimpieza}
                    columnas={[
                        {label: 'Código', field:'id_tipoLimp'}, 
                        {label: 'Nombre', field: 'nombre_tipo'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Tipos de Limpieza"
                />
            )}
            {mostrarModalTUs && (
                <ModalTable
                    onClose={() => setMostrarModalTUs(false)}
                    datos={tiposUsuario}
                    columnas={[
                        {label: 'Código', field:'id_tipoUsua'}, 
                        {label: 'Nombre', field: 'nombre_tipo'},
                        {label: 'Creador', field: 'user_crea'},
                        {label: 'Fecha creación', field: 'creado_el'},
                        {label: 'Modificador', field: 'user_modifica'},
                        {label: 'Fecha modificación', field: 'modificado_el'}
                    ]}
                    title="Tipos de Usuario"
                />
            )}
        </PagesDiv>
    </>);
}

export default Tipos;