export function getFechaHoraActual() {
    const ahora = new Date();

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

export function getFechaEquipo() {
    const ahora = new Date();

    //comprobar si la hora es igual o mayor a las 8 pm
    if(ahora.getHours() > 19) {
        ahora.setDate(ahora.getDate() + 1); //sumar un día
        const fecha = ahora.toISOString().split('T')[0]; //transformar a Date de mysql
        return fecha;
    } else { // si es menos de las 8 pm retornar el mismo día
        return ahora.toISOString().split('T')[0]; //transformar a Date de mysql
    }
}