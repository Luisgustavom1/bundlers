import app from './app/index';
import configs from './configs';

const port = 3000

export default { 
    app: app({
        options: configs,
        port
    }), 
}