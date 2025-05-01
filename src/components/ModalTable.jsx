import React from "react";
import styled from "styled-components";

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

function ModalTable({ onClose, datos, columnas, title }){
    return (
        <ModalOverlay>
            <ModalContent>
                <CloseButton onClick={onClose}>Cerrar</CloseButton>                
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
                        {datos.map((item, index) => (
                            <tr key={index}>
                                {columnas.map(({field}) => (
                                    <td key={field}>{item[field]}</td>
                                ))}                                
                            </tr>
                        ))}                        
                    </tbody>
                </Table>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ModalTable;