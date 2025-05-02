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
        const fecha = ahora.toLocaleDateString('en-CA'); //transformar a Date de mysql
        return fecha;
    } else { // si es menos de las 8 pm retornar el mismo día
        return ahora.toLocaleDateString('en-CA'); //transformar a Date de mysql
    }
}

export function fechaTitle() {
    const fechaActual = getFechaEquipo();
    const [year, month, day] = fechaActual.split('-'); //separar fechas

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    //ajustar el indice del mes
    const nombreMes = meses[parseInt(month, 10) -1];

    return `${day} de ${nombreMes} del ${year}`;
}

export function calcSumaHoras (horaInicial, tiempoEstimado) {
    const [h1, m1] = horaInicial.split(':').map(Number);
    const [h2, m2] = tiempoEstimado.split(':').map(Number);

    let minutosTotales = m1 + m2;
    let horasTotales = h1 + h2 + Math.floor(minutosTotales / 60);
    minutosTotales = minutosTotales % 60;

    //formato
    const hh = String(horasTotales).padStart(2, '0');
    const mm = String(minutosTotales).padStart(2, '0');

    return `${hh}:${mm}`;
}