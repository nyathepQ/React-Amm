import React from "react";
import styled from "styled-components";
import { useState } from "react";
import axios from 'axios';
import GlobalStyles from '../styles/GlobalStyles';

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
    background: rgb(206, 206, 206);
    padding: 20px;
    border-radius: 8px;
    max-height: 80vh;
    overflow-y: auto;
    width: 40%;
`;

const ModButton = styled.button`
    float: right;
    margin-bottom: 10px;
`;

const Mensaje = styled.p`
    color: ${props => (props.tipo === 'error' ? 'violet' : 'black')};
    text-align: center;
    padding: 10px;
`;

const LoginForm = styled.form`
    width: 20%;
    min-width: 300px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    padding-top: 15px;
    gap: 15px;
    border: 5px solid rgba(255, 255, 255, 0.089);
    border-radius: 15px;
    background-color:rgba(37, 94, 250, 0.51);

    i {
    margin-top: 15px;
    margin-bottom: 6px;
    color: black;
    }

    input {
    align-self: center;
    padding: 5px;
    min-width: 100px;
    width: 80%;
    max-width: 250px;
    height: 16px;
    margin-left: 5%;
    margin-right: 5%;
    border: 2px solid black;
    border-radius: 5px;
    background-color: #ffffff6b; /* Blanco con transparencia */
    }   

    div {
    flex-direction: row;
    align-self: center;
    gap: 5px;
    }
`;

function ModalRegister({onClose}){
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const defStatusNuevoUser = {nombre_usuario: '', contrasena: '', token: ''}
    const [nuevoUsuario, setNuevoUsuario] = useState(defStatusNuevoUser);

    const handleRegister = async (ev) => {
        ev.preventDefault();
        setMensaje('');
        setError('');

        const botonPress = ev.nativeEvent.submitter.name;

        if(botonPress === 'reg'){
            if(nuevoUsuario.nombre_usuario === '' || nuevoUsuario.contrasena === '' || nuevoUsuario.token === ''){
                return setMensaje('El campo no puede estar vacio');
            }
            try {
                const response = await axios.post('http://localhost:3001/register', nuevoUsuario);
                console.log(response);
                if (response.data.mensaje) {
                    setMensaje(response.data.mensaje);
                    setNuevoUsuario(defStatusNuevoUser);
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            } catch (err){
                setError(err.response.data.mensaje);
            }            
        } else if(botonPress === 'close'){
            onClose();
        }
    };

    return (<>
        <GlobalStyles/>
        <ModalOverlay>
            <ModalContent>                
                <h2 style={{color: 'black'}}>Registro</h2>
                <LoginForm onSubmit={handleRegister}>
                    <label htmlFor="nombre_usuario">Usuario</label>
                    <input
                        type="text"
                        name="nombre_usuario"
                        id="nombre_usuario"
                        value={nuevoUsuario.nombre_usuario}
                        onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, nombre_usuario: e.target.value.trimStart()}))}
                    />
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        name="contrasena"
                        id="contrasena"
                        value={nuevoUsuario.contrasena}
                        onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, contrasena: e.target.value.trimStart()}))}
                    />
                    <label htmlFor="token">Token</label>
                    <input
                        type="text"
                        name="token"
                        id="token"
                        value={nuevoUsuario.token}
                        onChange={(e) => setNuevoUsuario(nuevoUsuario => ({ ...nuevoUsuario, token: e.target.value}))}
                    />
                    <div>
                        <ModButton name="close">Cerrar</ModButton>
                        <ModButton name="reg">Registro</ModButton>                        
                    </div>
                </LoginForm>
                {/* Mensajes */}
                {error && <Mensaje tipo="error">{error}</Mensaje>}
                {mensaje && <Mensaje tipo="mensaje">{mensaje}</Mensaje>}
            </ModalContent>
        </ModalOverlay>
    </>);
};

export default ModalRegister;