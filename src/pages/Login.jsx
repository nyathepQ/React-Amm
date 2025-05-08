import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import axios from 'axios';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';
import logo from '../img/Logo.jpeg';
import ModalRegister from '../components/ModelRegister';

const MainLogin = styled.main`
    flex: 1;
`;

const HeaderQuestion = styled.header`
    text-align: right;
    aling-items: center;
    margin: -20px;

    a {
    text-decoration: none;
    align-self: top;
    color: black;
    }
`;

const DivLoginLogo = styled.div`
    margin: 15px;
`;

const LoginLogo = styled.img`
    border: 4px solid black;
    width: 100%;
    max-width: 300px;
    border-radius: 25%;
`;

const LoginForm = styled.form`
    width: 20%;
    min-width: 300px;
    min-height: 300px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    border: 5px solid rgba(255, 255, 255, 0.089);
    border-radius: 15px;
    background-color: #80a1fd81;

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

    button {
    align-self: center;
    padding: 5px;
    min-width: 100px;
    margin-top: 15%;
    }
`;

const FooterLogin = styled.footer`
    text-align: center;
    padding: 10px 0;
`;

const Mensaje = styled.p`
    color: ${props => (props.tipo === 'error' ? 'violet' : 'black')};
    text-align: center;
    border: 2px solid ${props => (props.tipo === 'error' ? 'white' : 'black')};
    padding: 10px;
    border-radius: 5px;
    background-color: ${props => (props.tipo === 'mensaje' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
`;

const IconLink = styled.a`
    color: black;
    text-decoration: none;
    margin: 25px;
`;

function Login() {
    const navigate = useNavigate();
    document.title = "Login | AMM";
    const { setUser: setUserContext } = useUser();
    const [username, setUserName] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        //logica
        try {
            const response = await axios.post('http://localhost:3001/login', {user: username, pass});

            if(response && response.data){
                setMensaje(response.data.mensaje);
                //guardar usuario en UserContext
                setUserContext(response.data.user);
                //redirigir
                navigate('/Inicio');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.mensaje);
            } else {
                console.error(error);
                setError('Hubo un error al realizar el inicio de sesión');
            }
        }
    };

    return (<>  
        <GlobalStyles/>
        <MainLogin>
            <HeaderQuestion>
                <a href="#" onClick={() => setMostrarModal(true)} rel="noopener noreferrer">
                    Registro<i className="fa-solid fa-circle-question fa-3x" style={{color: "black"}}></i>
                </a>
            </HeaderQuestion>
            <DivLoginLogo>
                <LoginLogo src={logo} alt="Logo ALF" />
            </DivLoginLogo>
            <div>
                {/* Mensajes */}
                {error && <Mensaje tipo="error">{error}</Mensaje>}
                {mensaje && <Mensaje tipo="mensaje">{mensaje}</Mensaje>}
                <LoginForm onSubmit={handleLogin}>
                    <i className="fa-solid fa-user fa-2x"></i>
                    <input
                        type="text"
                        value={username}
                        placeholder="Usuario"
                        onChange={(e)=> setUserName(e.target.value)}
                        required
                    />
                    <i className="fa-solid fa-lock fa-2x"></i>
                    <input
                        type="password"
                        value={pass}
                        placeholder="Contraseña"
                        onChange={(e)=> setPass(e.target.value)}
                        required
                    />
                    <button type="submit">Ingresar</button>                    
                </LoginForm>
            </div>
        </MainLogin>
        <FooterLogin>
            <IconLink href="https://www.facebook.com/AlfprofessionalC" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram fa-5x"></i>
            </IconLink>
            <IconLink href="https://www.instagram.com/alfprofessionalcleaning/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-facebook fa-5x"></i>
            </IconLink>
        </FooterLogin>
        {mostrarModal && (
            <ModalRegister
                onClose={() => setMostrarModal(false)}
            />
        )}
    </>
    );
};

export default Login;