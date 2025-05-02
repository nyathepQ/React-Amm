import Header from '../components/Header';
import styled from 'styled-components';
import GlobalStyles from '../styles/GlobalStyles';

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

    return (<>
        <GlobalStyles/>
        <Header/>
        <InicioPrimero>
            <StartData>
                <div>
                    <h1>Limpieza en curso</h1>
                </div>
                <ColumStart>
                <div>
                    <p>Lorem ipsum dolor sit</p>
                    <p>fecha</p>
                </div>
            </ColumStart>
            </StartData>            
            <StartData>
                <div>
                    <h1>Próxima limpieza</h1>
                </div>
                <ColumStart>
                    <div>
                        <p>fecha</p>
                    </div>
                </ColumStart>
            </StartData>
            <StartData>
                <div>
                    <h1>Finalización pendiente</h1>
                </div>
                <ColumStart>
                    <div>
                        <p>fecha</p>
                    </div>
                </ColumStart>
            </StartData>
        </InicioPrimero>
    </>);
}

export default Inicio;