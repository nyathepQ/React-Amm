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

export function formatearFecha(date) {
    const fecha = new Date(date);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

export function fechaTitle(date) {
    const fechaActual = formatearFecha(date);
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