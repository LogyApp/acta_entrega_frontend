const BACKEND_URL = 'https://acta-entrega-backend-594761951101.europe-west1.run.app/api/upload';

// Variables globales para el sistema de firma manual
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let ctx = null;

// FUNCIÓN PARA OBTENER PARÁMETROS DE LA URL
function obtenerParametrosURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const parametros = {};

    // Obtener todos los parámetros disponibles
    parametros.acta = urlParams.get('acta') || '12345';
    parametros.categoria = urlParams.get('categoria') || 'Dotación Personal';
    parametros.fechaentrega = urlParams.get('fechaentrega') || '';
    parametros.nombres = urlParams.get('nombres') || 'Juan Pérez García';
    parametros.fechaingreso = urlParams.get('fechaingreso') || '15/03/2024';
    parametros.operacion = urlParams.get('operacion') || 'Operación Ejemplo';
    parametros.identrega = urlParams.get('identrega') || 'ENT-2024-001';
    parametros.url_evidencia = urlParams.get('url_evidencia') || '';
    parametros.tipoclausula = urlParams.get('tipoclausula') || 'Cláusula de Ejemplo';
    parametros.clausula = urlParams.get('clausula') || 'Este es un texto de ejemplo para la cláusula. Puede contener múltiples líneas y información importante sobre los términos y condiciones de la entrega.';
    parametros.tallas = urlParams.get('tallas') || 'Camisa: M, Pantalón: 32, Zapatos: 42';
    parametros.firma = urlParams.get('firma') || '';
    parametros.iddotacion = urlParams.get('iddotacion') || 'EMP-001';
    parametros.usuarioTexto = urlParams.get('usuarioTexto') || 'Sistema LogyApp';
    parametros.itemsHtml = urlParams.get('itemsHtml') || '';

    return parametros;
}

// FUNCIÓN PARA CARGAR DATOS EN EL FORMULARIO
function cargarDatosFormulario() {
    const params = obtenerParametrosURL();

    console.log('📋 Parámetros recibidos:', params);

    // Cargar datos en los elementos correspondientes
    document.getElementById('categoria').textContent = params.categoria;
    document.getElementById('acta').textContent = `Acta No. ${params.acta}`;
    document.getElementById('nombres').textContent = params.nombres;
    document.getElementById('operacion').textContent = params.operacion;
    document.getElementById('fechaingreso').textContent = params.fechaingreso;
    document.getElementById('identrega').textContent = params.identrega;
    document.getElementById('tipoclausula').textContent = params.tipoclausula;
    document.getElementById('clausula').textContent = params.clausula;
    document.getElementById('tallas').textContent = params.tallas;
    document.getElementById('iddotacion').textContent = params.iddotacion;
    document.getElementById('usuarioTexto').textContent = params.usuarioTexto;
    document.getElementById('nombreFirmante').textContent = params.nombres;

    // Configurar fecha de entrega
    if (params.fechaentrega) {
        try {
            const fecha = new Date(params.fechaentrega);
            document.getElementById('fechaentrega').textContent =
                `Fecha de Entrega: ${fecha.toLocaleDateString('es-CO')} ${fecha.toLocaleTimeString('es-CO')}`;
        } catch (e) {
            document.getElementById('fechaentrega').textContent = `Fecha de Entrega: ${params.fechaentrega}`;
        }
    }

    // Configurar ID Usuario (extraer de nombres o usar un valor por defecto)
    // En una implementación real, esto vendría como parámetro separado
    const idUsuario = extraerIdUsuario(params.nombres) || params.iddotacion || '123456789';
    document.getElementById('idUsuario').textContent = idUsuario;

    // Configurar imagen de evidencia si existe
    if (params.url_evidencia) {
        const evidenceContainer = document.getElementById('client-evidence');
        const evidenceImg = document.getElementById('evidenciaImagen');
        evidenceImg.src = params.url_evidencia;
        evidenceContainer.hidden = false;
    }

    // Cargar items dinámicamente si se proporcionan
    if (params.itemsHtml) {
        try {
            document.getElementById('items').innerHTML = params.itemsHtml;
        } catch (e) {
            console.error('Error cargando items HTML:', e);
        }
    }
}

// FUNCIÓN AUXILIAR PARA EXTRAER ID DE USUARIO (ajusta según tu lógica)
function extraerIdUsuario(nombres) {
    // Esta función debería extraer el ID del usuario de los datos disponibles
    // Por ahora, usaremos el iddotacion como ID de usuario
    // En una implementación real, esto vendría como parámetro separado
    const params = obtenerParametrosURL();
    return params.iddotacion || '123456789';
}

// Función para imprimir
function imprimirPagina() {
    window.print();
}

// SISTEMA DE FIRMA MANUAL
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 Iniciando sistema de firma MANUAL...');

    // PRIMERO: Cargar datos del formulario desde los parámetros URL
    cargarDatosFormulario();

    // LUEGO: Configurar el sistema de firma
    const canvas = document.getElementById('signature-pad');
    const clearBtn = document.getElementById('clear');
    const saveBtn = document.getElementById('save');
    const estadoGuardado = document.getElementById('estadoGuardado');
    const loading = document.getElementById('loading');

    // CONFIGURAR CANVAS
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log('✅ Canvas configurado');

    // FUNCIONES PARA DIBUJO MANUAL
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getPosition(e);
    }

    function draw(e) {
        if (!isDrawing) return;

        const [x, y] = getPosition(e);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getPosition(e) {
        let x, y;
        if (e.type.includes('touch')) {
            const rect = canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }
        return [x, y];
    }

    // EVENT LISTENERS
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // BOTÓN BORRAR
    clearBtn.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // BOTÓN GUARDAR
    saveBtn.addEventListener('click', async function () {
        // Verificar si hay firma
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let hasSignature = false;

        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasSignature = true;
                break;
            }
        }

        if (!hasSignature) {
            alert('Por favor firma antes de finalizar.');
            return;
        }

        loading.style.display = 'block';
        estadoGuardado.style.display = 'block';
        estadoGuardado.textContent = '🔄 Generando PDF...';
        estadoGuardado.style.color = 'blue';
        saveBtn.disabled = true;

        try {
            // 1. Generar PDF
            const pdfBlob = await generarPDFConFirma();

            // 2. Subir a la nube (CARPETA DEL USUARIO REAL)
            estadoGuardado.textContent = '📤 Subiendo a la nube...';

            const resultadoUpload = await subirPDFaBucket(pdfBlob);

            estadoGuardado.textContent = '✅ Documento guardado en la nube';
            estadoGuardado.style.color = 'green';

            console.log('📁 Guardado en:', resultadoUpload.publicUrl);

            // 3. Descargar localmente también
            descargarPDF(pdfBlob);

        } catch (error) {
            console.error('Error:', error);
            estadoGuardado.textContent = '❌ Error: ' + error.message;
            estadoGuardado.style.color = 'red';

            // Aún así descargar localmente
            descargarPDF(await generarPDFConFirma());
            alert('Error al subir a la nube, pero se descargó localmente. Error: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            setTimeout(() => {
                loading.style.display = 'none';
            }, 3000);
        }
    });

    // Establecer fecha y hora actual en el footer
    document.getElementById('hora').textContent = new Date().toLocaleString('es-CO');

    console.log('🎉 Sistema de firma LISTO!');
});

// FUNCIÓN PARA GENERAR PDF
async function generarPDFConFirma() {
    return new Promise((resolve, reject) => {
        try {
            // Ocultar elementos que no deben aparecer en el PDF
            const elementosAOcultar = [
                document.querySelector('.print-button'),
                document.querySelector('.signature-buttons'),
                document.getElementById('signature-pad'),
                document.getElementById('estadoGuardado')
            ];

            // Guardar estados originales
            const estadosOriginales = elementosAOcultar.map(el => ({
                element: el,
                display: el ? el.style.display : 'none'
            }));

            // Ocultar elementos
            elementosAOcultar.forEach(el => {
                if (el) el.style.display = 'none';
            });

            // Agregar firma como imagen en lugar del canvas
            const firmaDataUrl = document.getElementById('signature-pad').toDataURL('image/png');
            const firmaImg = document.createElement('img');
            firmaImg.src = firmaDataUrl;
            firmaImg.style.maxWidth = '200px';
            firmaImg.style.margin = '10px auto';
            firmaImg.style.display = 'block';
            firmaImg.style.border = '1px solid #ddd';
            firmaImg.style.borderRadius = '4px';

            const signatureBox = document.querySelector('.signature-box');
            const existingFirma = signatureBox.querySelector('#firma-temporal');
            if (existingFirma) existingFirma.remove();

            firmaImg.id = 'firma-temporal';
            signatureBox.insertBefore(firmaImg, document.getElementById('nombreFirmante'));

            // Capturar con html2canvas
            html2canvas(document.getElementById('contenido'), {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                // Restaurar elementos ocultos
                estadosOriginales.forEach(item => {
                    if (item.element) {
                        item.element.style.display = item.display;
                    }
                });

                // Remover firma temporal
                const tempFirma = document.getElementById('firma-temporal');
                if (tempFirma) tempFirma.remove();

                // Crear PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');

                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 5;

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                const pdfBlob = pdf.output('blob');
                resolve(pdfBlob);
            }).catch(error => {
                // Asegurarse de restaurar elementos incluso si hay error
                estadosOriginales.forEach(item => {
                    if (item.element) {
                        item.element.style.display = item.display;
                    }
                });
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
}

// FUNCIÓN PARA SUBIR AL BUCKET - USA DATOS REALES DE LOS PARÁMETROS
async function subirPDFaBucket(pdfBlob) {
    const params = obtenerParametrosURL();

    // OBTENER DATOS REALES DEL FORMULARIO
    const datos = {
        idUsuario: document.getElementById('idUsuario').textContent.trim(),
        identrega: document.getElementById('identrega').textContent.trim(),
        nombres: document.getElementById('nombres').textContent.trim(),
        acta: document.getElementById('acta').textContent.replace('Acta No. ', '').trim()
    };

    console.log('📤 Enviando PDF para usuario:', datos.idUsuario);
    console.log('📋 Datos:', datos);

    // Validar que tenemos un ID de usuario válido
    if (!datos.idUsuario || datos.idUsuario === '123456789') {
        throw new Error('ID de usuario no válido. Verifique los datos del formulario.');
    }

    // Convertir a base64
    const base64String = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(pdfBlob);
    });

    console.log('📤 Enviando PDF a carpeta del usuario:', datos.idUsuario);

    // Enviar al backend
    const response = await fetch(`${BACKEND_URL}/pdf-base64`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pdfBase64: base64String,
            idUsuario: datos.idUsuario,
            identrega: datos.identrega,
            nombres: datos.nombres,
            acta: datos.acta
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.data;
}

// FUNCIÓN PARA DESCARGA LOCAL - ACTUALIZADA
function descargarPDF(pdfBlob) {
    // Obtener datos reales para el nombre del archivo
    const idUsuario = document.getElementById('idUsuario').textContent.trim();
    const identrega = document.getElementById('identrega').textContent.trim();
    const nombres = document.getElementById('nombres').textContent.trim();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `acta_${identrega}_${nombres.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
