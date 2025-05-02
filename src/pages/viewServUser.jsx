import { useState, useEffect } from "react";
import { useUser } from "../components/UserContext";
import { data, useNavigate } from "react-router-dom";
import axios from 'axios';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import { fechaTitle, getFechaEquipo } from "../utils/time";

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-height: 80vh;
    overflow-y: auto;
    width: 80%;
`;

const CloseButton = styled.button`
    float: right;
    margin-bottom: 10px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        padding: 8px;
        border: 1px solid #ccc;
        text-align: center;
    }

    th {
        background-color: #f4f4f4;
    }
`;

function ViewServicios() {
    document.title = "Servicios asignados | AMM";
    const { user } = useUser();
    const navigate = useNavigate();
    const fechaTi = fechaTitle();
    const title = `Servicios ${fechaTi}`;

    const [servicios, setServicios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [usuariosEquipo, setUsuariosEquipo] = useState([]);
    const [tiposLimp, setTiposLimp] = useState([]);
    const [datosModal, setDatosModal] = useState([]);

    const columnas = [
        {label: 'Cliente', field:'nombre_cliente'},
        {label: 'Dirección', field:'direccion'},
        {label: 'Limpieza', field: 'limpieza'},
        {label: 'Fecha', field: 'fecha'},
        {label: 'Hora', field: 'hora'},
        {label: 'Tiempo de Servicio', field: 'tiempo_estimado'},
        {label: 'Observaciones', field: 'observacion'}
    ];

    //cargar datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resClient, resUsEq, resTLimp] = await Promise.all([
                axios.get('http://localhost:3001/clientes'),
                axios.get('http://localhost:3001/equipos/usuarios'),
                axios.get('http://localhost:3001/tipos/limpieza')
            ]);
            setClientes(resClient.data);
            setUsuariosEquipo(resUsEq.data);
            setTiposLimp(resTLimp.data);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    const obtenerPorFecha = async (fecha, id_equipo) => {
        const dataRes = await axios.post('http://localhost:3001/servicios/equipofecha', {fecha, id_equipo});
        return dataRes.data;
    }

    const buscarServ = async () => {
        const equipoDeUser = usuariosEquipo.filter(emp => emp.id_usuario === user.id_usuario);
        const ids = equipoDeUser.map(eq => parseInt(eq.id_equipo));
        const fecha = getFechaEquipo();

        try {
            const resultados = await Promise.all(
                ids.map(id => obtenerPorFecha(fecha, id))
            );

            const serviciosObtenidos = resultados.flat();

            setServicios(serviciosObtenidos);

            const datosCompletos = serviciosObtenidos.map(us => {
                const cl = clientes.find(u => u.id_cliente === us.id_cliente);
                const tipoLimp = tiposLimp.find(u => u.id_tipoLimp === us.id_tipoLimp);
                
                return {
                    ...us,
                    nombre_cliente: `${cl?.nombre_cliente ?? ''} ${cl?.apellido_cliente ?? ''}`,
                    direccion: cl?.direccion_cliente,
                    limpieza: tipoLimp?.nombre_tipo
                };
            });

            setDatosModal(datosCompletos);
        } catch (error) {
            console.error('Error al buscar servicios: ', error);
        }        
    };

    const onBack = () => {        
        navigate('/Inicio');
    };

    return (<>
        <GlobalStyles/>
        <ModalOverlay>
            <ModalContent>
                <div>
                <CloseButton onClick={onBack}>Regresar</CloseButton>
                <CloseButton onClick={buscarServ}>Cargar</CloseButton>
                </div>
                <h2 style={{color: 'black'}}>{title}</h2>
                <Table>                    
                    <thead>
                        <tr>
                            {columnas.map(({label}) => (
                                <th key={label}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {datosModal.map((item, index) => (
                            <tr key={index}>
                                {columnas.map(({field}) => (
                                    <td key={field}>
                                        {field === 'fecha' ? new Date(item[field]).toLocaleDateString('es-CO') : item[field]}
                                    </td>
                                ))}                                
                            </tr>
                        ))}                        
                    </tbody>
                </Table>
            </ModalContent>
        </ModalOverlay>
    </>);
};

export default ViewServicios;