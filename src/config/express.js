const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const path = require('path');

module.exports = (application, config) => {
    const app = application;
    const env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env === 'development';

    // app.set('views', path.resolve(config.root, './src/views'));
    app.set('view engine', 'njk');
    nunjucks.configure(path.resolve(config.root, './src/views'), {
        autoescape: true,
        express: app
    });

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    app.use(cookieParser());
    app.use(compress());
    // app.use(express.static(path.join(__dirname, 'public')));
    app.use(methodOverride());

    return app;
};
