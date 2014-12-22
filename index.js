var config = require('./config/config.json'),
    server = require('./lib/server');

config.PORT = process.env.PORT || config.PORT;

server.run(config);
