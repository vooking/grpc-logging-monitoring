const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PROTO_PATH = path.join(__dirname, 'proto', 'logging.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDef);
const client = new grpcObject.logging.LogService('localhost:50051', grpc.credentials.createInsecure());

app.post('/send', (req, res) => {
  client.SendLog(req.body, (err, _) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'ok' });
  });
});

app.post('/query', (req, res) => {
  client.QueryLogs(req.body, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.entries);
  });
});

app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { service, level } = req.query;
  const stream = client.StreamLogs({ service, level });
  
  stream.on('data', (log) => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  stream.on('end', () => res.end());
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    res.end();
  });

  req.on('close', () => stream.destroy());
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`REST-прокси запущен на http://localhost:${PORT}`);
});