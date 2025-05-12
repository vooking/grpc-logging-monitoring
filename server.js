const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs-extra');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'logging.proto');
const LOG_FILE = path.join(__dirname, 'logs.json');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).logging;

let logs = [];
if (fs.existsSync(LOG_FILE)) {
  logs = fs.readJSONSync(LOG_FILE);
  console.log(`Загружено ${logs.length} логов из файла.`);
}

function saveLogsToFile() {
  fs.writeJSONSync(LOG_FILE, logs, { spaces: 2 });
}

const sendLog = (call, callback) => {
  const logEntry = call.request;
  logs.push(logEntry);
  saveLogsToFile();
  console.log('Получен лог:', logEntry);
  callback(null, {});
};

const queryLogs = (call, callback) => {
  const { service, level } = call.request;
  const filtered = logs.filter(log =>
    (!service || log.service === service) &&
    (!level || log.level === level)
  );
  callback(null, { entries: filtered });
};

const streamLogs = (call) => {
  const { service, level } = call.request;
  logs.forEach(log => {
    if ((!service || log.service === service) &&
        (!level || log.level === level)) {
      call.write(log);
    }
  });
  call.end();
};

const server = new grpc.Server();
server.addService(proto.LogService.service, {
  SendLog: sendLog,
  QueryLogs: queryLogs,
  StreamLogs: streamLogs,
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('gRPC сервер запущен на порту 50051');
  server.start();
});
