// // Seleccionar elementos del DOM
// const startButton = document.getElementById('start');
// const stopButton = document.getElementById('stop');
// const audioElement = document.getElementById('audio');
// let mediaRecorder;
// let chunks = [];

// // Función para iniciar la grabación
// startButton.addEventListener('click', async () => {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         mediaRecorder = new MediaRecorder(stream);

//         mediaRecorder.ondataavailable = function(event) {
//             chunks.push(event.data);
//         }

//         mediaRecorder.onstop = function() {
//             const blob = new Blob(chunks, { type: 'audio/webm' });
//             const url = URL.createObjectURL(blob);
//             audioElement.src = url;
//             // Aquí puedes enviar el blob a tu servidor para guardarlo
//             chunks = [];
//         }

//         mediaRecorder.start();
//     } catch (error) {
//         console.error('Error al acceder al micrófono:', error);
//     }
// });

// // Función para detener la grabación
// stopButton.addEventListener('click', () => {
//     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//         mediaRecorder.stop();
//     }
// });
