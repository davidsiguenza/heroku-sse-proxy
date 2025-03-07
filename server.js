import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/sse-proxy', async (req, res) => {
  // Extraemos los parámetros de la query string
  const { scrtUrl, conversationId, lastEventId, orgId, accessToken } = req.query;
  
  // Verificamos que se hayan pasado todos los parámetros necesarios
  if (!scrtUrl || !conversationId || !orgId || !accessToken) {
    return res.status(400).send('Faltan parámetros necesarios: scrtUrl, conversationId, orgId y accessToken.');
  }
  
  // Construir la URL del endpoint SSE de Salesforce
  const sseUrl = `https://${scrtUrl}/eventrouter/v1/sse?conversationId=${conversationId.toLowerCase()}&lastEventId=${lastEventId || '0'}`;
  
  try {
    // Realizamos la petición al endpoint SSE, ahora agregando el header X-Org-Id
    const response = await fetch(sseUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${accessToken}`,
        'X-Org-Id': orgId
      }
    });
    
    if (!response.ok) {
      const errMsg = await response.text();
      return res.status(response.status).send(errMsg);
    }
    
    // Configuramos los headers de la respuesta para que el navegador acepte la conexión CORS.
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*' // Puedes restringir a tu dominio si lo prefieres
    });
    
    console.log(`Conectado al SSE: ${sseUrl}`);
    
    // Transmitir el cuerpo (stream) de la respuesta al cliente
    response.body.pipe(res);
    
    // Si la conexión se cierra, finalizamos el stream
    req.on('close', () => {
      console.log('Cliente cerró la conexión SSE.');
      response.body.destroy();
    });
  } catch (error) {
    console.error('Error en el proxy SSE:', error);
    res.status(500).send('Error en el proxy SSE');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy SSE escuchando en el puerto ${PORT}`);
});
