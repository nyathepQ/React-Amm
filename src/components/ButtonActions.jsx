import React from 'react';

function ButtonActions() {
    const acciones = [
        { label: 'Buscar', name: 'buscar'},
        { label: 'Crear/Modificar', name: 'crear/modificar'},
        { label: 'Mostrar registros', name: 'mostrar'},
        { label: 'Eliminar', name: 'eliminar'}
    ];

    return (<div>
        {acciones.map(({label, name}) => (
            <button key={name} type="submit" name={name}>
                {label}
            </button>
        ))}
    </div>);
};

export default ButtonActions;