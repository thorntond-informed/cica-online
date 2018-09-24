const express = require('express');
const glob = require('glob');

const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const path = require('path');

module.exports = (app, config) => {
    const env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';

    // app.set('views', path.resolve(config.root, './src/views'));
    app.set('view engine', 'njk');
    nunjucks.configure(path.resolve(config.root, './src/views'), {
        autoescape: true,
        express: app
    });

    // app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    // app.use(express.static(path.join(__dirname, 'public')));
    app.use(methodOverride());

    // var controllers = glob.sync(config.root + '/app/controllers/*.js');
    // controllers.forEach((controller) => {
    //   require(controller)(app);
    // });

    /**********************************************/
    /** MIDDLEWARE                               **/
    /**********************************************/

    // const exegesisExpress = require('exegesis-express');
    
    // async function exegesisMiddleware() {
    //     // See https://github.com/exegesis-js/exegesis/blob/master/docs/Options.md
    //     const options = {
    //         controllers: path.join(config.root, '/src/controllers'),
    //         allowMissingControllers: false
    //     };
    
    //     // This creates an exgesis middleware, which can be used with express,
    //     // connect, or even just by itself.
    //     const exegesisMiddleware = await exegesisExpress.middleware(
    //         path.join(config.root, '/schema/openapi.json'),
    //         options
    //     );
    
    //     // If you have any body parsers, this should go before them.
    //     app.use(exegesisMiddleware);
    //     return app;
    // }
    
    // return exegesisMiddleware()
    // .then((app) => {
        
        // app.listen(config.port, () => {
        //     console.log(`Express server listening on port ${config.port}`);
        // });
        // return app;
    // })
    // .catch(err => {
        // console.error(err.stack);
        // process.exit(1);
    // });

    // /**********************************************/
    // /** SWAGGER                                  **/
    // /**********************************************/

    // const swaggerUi = require('swagger-ui-express');
    // const swaggerDocument = require(`${config.root}/schema/openapi.json`);
    // // const yaml = require('yamljs'); // YAML to JSON.
    // //const swaggerDocument = yaml.load(`${config.root}/public/api-description.yaml`);

    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // /**********************************************/
    // /** ROUTING                                  **/
    // /**********************************************/

    // const routesApi = require('../routes/api');
    // app.use('/api/v1/', routesApi);

    // const routes = require('../routes/');
    // app.use('/', routes);

    // app.use((req, res, next) => {
    //     var err = new Error('Not Found');
    //     err.status = 404;
    //     next(err);
    // });

    // if (app.get('env') === 'development') {
    //     app.use((err, req, res, next) => {
    //         res.status(err.status || 500);
    //         res.render('error', {
    //             message: err.message,
    //             error: err,
    //             title: 'error'
    //         });
    //     });
    // }

    // app.use((err, req, res, next) => {
    //     res.status(err.status || 500);
    //     res.render('error', {
    //         message: err.message,
    //         error: {},
    //         title: 'error'
    //     });
    // });

    return app;
};
