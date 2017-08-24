
const LONG_QUERY_DURATION_IN_MS = 10 * 60 * 1000;
const DB_URL = 'mongodb://localhost:27017/test_mongoose_callbacks';

const mongoose = require('mongoose');
mongoose.Promise = Promise;

var startTime = new Date().getTime();
var log = (msg) => {
  var seconds = Math.round(new Date().getTime() - startTime);
  console.log(seconds+") "+msg);
};

var Model = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, trim: true, default: 'test' }
}), 'test');

mongoose.connection.on('connecting',   () => { log('Database connecting...'); });
mongoose.connection.on('timeout',      () => { log('Database timeout...'); });
mongoose.connection.on('error',        () => { log('Database error...'); });
mongoose.connection.on('disconnected', () => { log('Database disconnected...'); });

const doRequest = function (title, slow) {
  var logRequest = (msg) => { log(title+": "+msg); };

  logRequest("starting...");
  var filter = slow ? {$where: 'sleep('+LONG_QUERY_DURATION_IN_MS+') || true'} : {};
  Model.count(filter).exec((err, count) => {
    logRequest(err ? "failed: "+err : "success: "+count);
  });
};

mongoose.connection.on('connected', () => {
  log("Database connected...");
 log("Dropping...");
 mongoose.connection.db.dropDatabase(function(){
   log("Creating...");
   Model.create([ {name: 'test1'} ], function(){
      setTimeout(() => { doRequest("FastQuery-A", false); }, 0);
      setTimeout(() => { doRequest("SlowQuery", true);  }, 1000);
      setTimeout(() => { doRequest("FastQuery-B", false); }, 2000);
      setTimeout(() => { doRequest("FastQuery-C", false); }, LONG_QUERY_DURATION_IN_MS+5000);
      setTimeout(() => { log("Giving Up..."); }, 2*LONG_QUERY_DURATION_IN_MS+10000);
    });
  });
});

mongoose.connect(DB_URL, {
  useMongoClient: true,
  autoReconnect: false,
  poolSize: 1
}).catch((err)=>{ log('Connect failed', err); });

setInterval(()=>{
  if (mongoose.connection.readyState === 1) return;
  log('Mongoose.readystate = ', mongoose.connection.readyState);
}, 1000);
