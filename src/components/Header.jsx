import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import logo from '../img/Logo.jpeg';

const HeaderPages = styled.header`
    background-color: #A8B8FF;
    display: flex;
    flex-direction: column;
    height: auto;
    margin-top: -30px;
    margin-left: -30px;
    margin-right: -30px;
    border-radius: 0 0 15px 15px;
`;

const IconUserName = styled.div`
    display: flex;
    flex-direction: row;
    height: fit-content;
    width: fit-content;
    gap: 10px;

    a {
        margin: auto;
        margin-left: 5px;
    }
`;

const NameUserShow = styled.p`
    color: white;
    height: fit-content;
    width: fit-content;

    &:hover {
        color: black;
        text-decoration: underline;
        cursor: pointer;        
    }
`;

const LogoList = styled.div`
    display: flex;
    flex-direction: row;
    padding: auto;
`;

const LogoPages = styled.img`
    margin: 16px;
    width: 100px;
    height: 100px;
    border-radius: 50%;

    &:hover{
        cursor: pointer;
    }
`;

const ListPages = styled.div`
    width: 90%;

    ul {
        list-style: none;
        display: flex;
        gap: 15px;
        padding: 0;
        margin: 40px auto;
    }

    li {
        width: 100%;
        height: auto;
        margin: auto;
        padding: 12px;
        border: 2px solid black;
        border-radius: 5px;
        background-color: #001a9075;

        &:hover {
            background-color: #5271FF;
            box-shadow: 0 0 2px 2px #001a90;
        }
    }

    a {
        text-decoration: none;
        color: white;

        &:hover {
        color: black;
        font-weight: bold;
        cursor: pointer;
        }
    }
`;

const ActualPage = styled.li`
    background-color: #5271FF !important;
    font-weight: bold;
    box-shadow: 1px 5px 2px 2px #000000;

    a {
        color: black;
        cursor: default !important;
    }

    &:hover {
        box-shadow: 1px 5px 2px 2px #000000 !important;
    }
`;

function Header() {
    const navigate = useNavigate();
    const { user } = useUser();
    const location = useLocation();

    const handleNavegation = (ruta) => {
        navigate(ruta);
    }

    const handleLogout = (e) => {
        e.preventDefault();
        navigate('/');
    }

    return (<>
        <HeaderPages>
            <IconUserName>
                <a href="https://wa.me/573212300716" target="_blank">
                    <i className="fa-solid fa-circle-question fa-2x question_icon" style={{color: "black", cursor: "help"}}></i>
                </a>
                <NameUserShow onClick={handleLogout}>
                    {user ? `${user.nombre_usuario} (Cerrar sesión)` : 'Invitado (Ingresar)'}
                </NameUserShow>
            </IconUserName>
            <LogoList>
                <LogoPages onClick={() => handleNavegation ('/Inicio')} src={logo} alt="Logo ALF"/>
                <ListPages>
                    <ul>
                        {user?.id_tipoUsua !== 3 ? (
                            <>
                                {location.pathname !== '/Servicios' ? (<li><a onClick={() => handleNavegation('/Servicios')}>Agenda</a></li>) : (<ActualPage><a>Agenda</a></ActualPage>)}
                                {location.pathname !== '/Empleados' ? (<li><a onClick={() => handleNavegation('/Empleados')}>Empleados</a></li>) : (<ActualPage><a>Empleados</a></ActualPage>)}
                                {location.pathname !== '/Equipos' ? (<li><a onClick={() => handleNavegation('/Equipos')}>Equipos</a></li>) : (<ActualPage><a>Equipos</a></ActualPage>)}
                                {location.pathname !== '/Clientes' ? (<li><a onClick={() => handleNavegation('/Clientes')}>Clientes</a></li>) : (<ActualPage><a>Clientes</a></ActualPage>)}
                                {location.pathname !== '/Tipos' ? (<li><a onClick={() => handleNavegation('/Tipos')}>Tipos</a></li>) : (<ActualPage><a>Tipos</a></ActualPage>)}
                            </>
                        ) : (
                            <li><a>Lista de servicios asignados</a></li>
                        )}
                    </ul>
                </ListPages>
            </LogoList>
        </HeaderPages>
    </>);
}

export default Header;