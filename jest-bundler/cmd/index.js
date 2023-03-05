const app = require('./app/index');
const port = 3000

module.exports = { 
    app: app(require('./configs')), 
    port 
};