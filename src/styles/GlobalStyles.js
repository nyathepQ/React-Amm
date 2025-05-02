import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        font-family: Arial, sans-serif;
        background-color: #5271FF;
        color: black;
        padding: 20px;
        min-height: 100vh;
    }

    #root {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    button {
        margin: 5px;
        align-self: center;
        width: fit-content;
        min-width: 40px;
        width: 120px;
        height: 35px;
        border: 1px solid black;
        background-color: #001A90;
        color: white;
        padding: 1px;
        border-radius: 5px;

        &:hover {
            background-color: #A8B8FF;
            color: black;
            border: 1px solid white;
            cursor: pointer;
        }
    }

    input {
        &:placeholder {
            color: #646464;
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 2px 2px #001a90;
        }

        &:disabled {
            background-color: #464646;
            color: #cacaca;
            border: 0px;
        }
    }

    select {
        &:disabled {
            background-color: #464646;
            color: #cacaca;
            border: 0px;
        }
    }

    h1 {
        color: white;
        font-weight: bold;
    }

    h2 {
        margin: 2px;
    }

    .form_pages {
        margin: 5px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        width: fit-content;
        border: 2px solid black;
        border-radius: 15px;
        background-color: #ffffff9c;        
    }

    .form_pages div {
        align-items: center;
    }

    .form_pages input {
        width: 100%;
        padding: 5px;
    }

    .form_pages label {
        font-weight: bold;
    }

    .form_display {
        margin: 20px;
        display: grid;
        grid-template-columns: 35% 65%;
        gap: 10px;
        width: 80%;
        height: fit-content;
    }

    .form_display label {
        text-align: right;
        padding-right: 10px;
        align-self: center;
    }
`;


export default GlobalStyles;