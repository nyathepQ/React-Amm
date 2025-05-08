import Header from '../components/Header';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import { useUser } from "../components/UserContext";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { fechaTitle, formatearFecha } from '../utils/time';
import React from 'react';

const InicioPrimero = styled.div`
    margin: 10px;
    width: 100%;
    min-height: 75vh;
    align-self: center;
    display: flex;
    flex-direction: row;
    gap: 50px;
`;

const StartData = styled.div`
    margin: 40px auto;

    div, h1 {
        min-width: 100px;
    }
`;

const ColumStart = styled.div`
    flex-direction: row;
    padding: 5px;
    background-color: #001a9049;
    color: white;
    min-width: 200px;
    height: 85%;
    border-radius: 10px;
    box-shadow: 6px 6px 10px 5px #001A90;

    div {
        padding: 10px;
        margin: 5px;
        width: auto;
        margin-bottom: 10px;
        background-color: rgba(0, 0, 0, 0.377);
        border: 1px solid white;
        border-radius: 10px;
    }
`;



function Inicio(){
    document.title = "Inicio | AMM";
    
    const { user } = useUser();
    const navigate = useNavigate();
    const [serviciosMostrarHoy, setServiciosMostrarHoy] = useState([]);
    const [serviciosMostrarTom, setServiciosMostrarTom] = useState([]);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if(!user){
        navigate('/');  
    }

    //cargar datos
    useEffect(() => {
        cargarDatos();
    });

    const cargarDatos = async () => {
        try {
            const [resServToday, resServTomorrow, resClient, resEquip, resTLimp] = await Promise.all([
                axios.get(`http://localhost:3001/servicios/${formatearFecha(today)}`),
                axios.get(`http://localhost:3001/servicios/${formatearFecha(tomorrow)}`),
                axios.get('http://localhost:3001/clientes'),
                axios.get('http://localhost:3001/equipos'),
                axios.get('http://localhost:3001/tipos/limpieza')
            ]);

            const serviciosHoy = resServToday.data;
            const serviciosManana = resServTomorrow.data;
            const clientes = resClient.data;
            const equipos = resEquip.data;
            const tiposLimpieza = resTLimp.data;

            // Construir arrays con los datos combinados
            const mostrarHoy = serviciosHoy.map(serv => {
                const cliente = clientes.find(c => c.id_cliente === serv.id_cliente);
                const equipo = equipos.find(e => e.id_equipo === serv.id_equipo);
                const tipoLimp = tiposLimpieza.find(t => t.id_tipoLimp === serv.id_tipoLimp);

                return {
                    id_servicio: serv.id_servicio,
                    nombre_cliente: `${cliente?.nombre_cliente ?? 'N/A'} ${cliente?.apellido_cliente ?? ''}`,
                    direccion_cliente: cliente?.direccion_cliente ?? '',
                    nombre_equipo: equipo?.nombre_equipo ?? '',
                    nombre_tipo_limp: tipoLimp?.nombre_tipo ?? '',
                    fecha: formatearFecha(serv.fecha),
                    hora: serv.hora,
                    tiempo_estimado: serv.tiempo_estimado,
                    tiempo_finalizacion: serv.tiempo_finalizacion,
                    precio: serv.precio,
                    observacion: serv.observacion
                };
            });

            const mostrarManana = serviciosManana.map(serv => {
                const cliente = clientes.find(c => c.id_cliente === serv.id_cliente);
                const equipo = equipos.find(e => e.id_equipo === serv.id_equipo);
                const tipoLimp = tiposLimpieza.find(t => t.id_tipoLimp === serv.id_tipoLimp);

                return {
                    id_servicio: serv.id_servicio,
                    nombre_cliente: `${cliente?.nombre_cliente ?? 'N/A'} ${cliente?.apellido_cliente ?? ''}`,
                    direccion_cliente: cliente?.direccion_cliente ?? '',
                    nombre_equipo: equipo?.nombre_equipo ?? '',
                    nombre_tipo_limp: tipoLimp?.nombre_tipo ?? '',
                    fecha: formatearFecha(serv.fecha),
                    hora: serv.hora,
                    tiempo_estimado: serv.tiempo_estimado,
                    tiempo_finalizacion: serv.tiempo_finalizacion,
                    precio: serv.precio,
                    observacion: serv.observacion
                };
            });

            // Actualizar el estado con los arrays completos
            setServiciosMostrarHoy(mostrarHoy);
            setServiciosMostrarTom(mostrarManana);
        } catch (error) {
            console.error('Error en la carga de datos ', error);
        }
    }

    return (<>
        <GlobalStyles/>
        <Header/>
        <InicioPrimero>
            <StartData>
                <div>
                    <h1>Servicios {fechaTitle(today)}</h1>
                </div>
                <ColumStart>
                    <div>
                        {serviciosMostrarHoy.length === 0 ? (
                            <p>No hay servicios</p>
                        ) : serviciosMostrarHoy.map(serv => (<React.Fragment key={serv.id_servicio}>
                            <p>Cliente: {serv.nombre_cliente}</p>
                            <p>Dirección: {serv.direccion_cliente}</p>
                            <p>Equipo: {serv.nombre_equipo}</p>
                            <p>Limpieza: {serv.nombre_tipo_limp}</p>
                            <p>Hora: {serv.hora}</p>
                            <p>Finalización: {serv.tiempo_finalizacion}</p>
                            <p>Precio: {serv.precio}</p>
                            {serv.observacion === '' ? '' : (<p>Observación: {serv.observacion}</p>)}
                        </React.Fragment>))
                        }
                    </div>
            </ColumStart>
            </StartData>            
            <StartData>
                <div>
                    <h1>Servicios {fechaTitle(tomorrow)}</h1>
                </div>
                <ColumStart>
                    <div>
                        {serviciosMostrarTom.length === 0 ? (
                            <p>No hay servicios</p>
                        ) : serviciosMostrarTom.map(serv => (<React.Fragment key={serv.id_servicio}>
                            <p>Cliente: {serv.nombre_cliente}</p>
                            <p>Dirección: {serv.direccion_cliente}</p>
                            <p>Equipo: {serv.nombre_equipo}</p>
                            <p>Limpieza: {serv.nombre_tipo_limp}</p>
                            <p>Hora: {serv.hora}</p>
                            <p>Finalización: {serv.tiempo_finalizacion}</p>
                            <p>Precio: {serv.precio}</p>
                            {serv.observacion === '' ? '' : (<p>Observación: {serv.observacion}</p>)}
                        </React.Fragment>))
                        }
                    </div>
                </ColumStart>
            </StartData>
        </InicioPrimero>
    </>);
}

export default Inicio;