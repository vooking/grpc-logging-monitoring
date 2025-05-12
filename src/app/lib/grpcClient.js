const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/logging.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const loggingProto = grpc.loadPackageDefinition(packageDefinition).logging;

const client = new loggingProto.LogService('localhost:50051', grpc.credentials.createInsecure());

function sendLog() {
  const logEntry = {
    service: 'frontend',
    level: 'INFO',
    message: 'Пользователь открыл страницу',
    timestamp: Date.now(),
  };

  client.SendLog(logEntry, (err, response) => {
    if (err) console.error('SendLog error:', err);
    else console.log('SendLog success');
  });
}

function queryLogs() {
  client.QueryLogs({}, (err, response) => {
    if (err) console.error('QueryLogs error:', err);
    else console.log('QueryLogs response:', response.entries); 
  });
}

function streamLogs() {
  console.log('Starting StreamLogs...');
  const stream = client.StreamLogs({ level: 'ERROR' });
  stream.on('data', (log) => {
    console.log('StreamLogs received:', log);
  });
  stream.on('end', () => console.log('StreamLogs ended'));
  stream.on('error', (err) => console.error('StreamLogs error:', err));
}

module.exports = { sendLog, queryLogs, streamLogs };

if (require.main === module) {
  sendLog();
  setTimeout(queryLogs, 1000);
  setTimeout(streamLogs, 2000);
}