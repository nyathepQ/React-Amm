import { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';
import ButtonActions from '../components/ButtonActions';
import Header from '../components/Header';
import axios from 'axios';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';

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

    const [nuevoDoc, setNuevoDoc] = useState({ id_tipoDocu: '', nombre_tipo: '', user_modifica: ''});
    const [nuevaLimp, setNuevaLimp] = useState({id_tipoLimp: '', nombre_tipo: '', user_modifica: ''});

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

        if(!user || user.id_tipoUsua !== 3){
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
                setMensaje('Debe seleccionar un Código valido para buscar');
                setError('');
            }
        } else if (botonPress === 'crear/modificar') {
            if(idSeleccionado !== "NA"){
                //modificar
                setNuevoDoc(nuevoDoc => ({...nuevoDoc, user_modifica: user.nombre_usuario}));
                const response = await axios.post('http://localhost:3001/tipos/documento/update', nuevoDoc);
                if (response.mensaje) {
                    setMensaje(response.mensaje);
                } else if (response.error) {
                    setError(response.error);
                }
            } else {    
                //crear
                const response = await axios.post('http://localhost:3001/tipos/documento/insert', {
                    nombre_tipo: nuevoDoc.nombre_tipo,
                    user_crea: user.nombre_usuario
                });
                if (response.mensaje) {
                    setMensaje(response.mensaje);
                } else if (response.error) {
                    setError(response.error);
                }
            }
        } else if (botonPress === 'mostrar') {

        } else if (botonPress === 'eliminar') {

        }
    }

    return(<>
        <GlobalStyles/>
        <Header/>
        <PagesDiv>
            <div>
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
                    {/* Mensajes */}
                    {error && <Mensaje tipo="error">{error}</Mensaje>}
                    {mensaje && <Mensaje tipo="mensaje">{mensaje}</Mensaje>}
                </form>
            </div>
        </PagesDiv>
    </>);
}

export default Tipos;