const express = require('express');
const config = require('./config/config');
const path = require('path');
const routes = require('./routes/index');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');

const app = express();

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';

// add the config to the request object.
app.use((req, res, next) => {
    req.config = config;
    return next();
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
app.use(methodOverride());

/* ******************************************** */
/* * SUB APPS                                 * */
/* ******************************************** */

app.use('/', express.static(path.resolve(__dirname, '../public')));
app.use('/', routes);

// const apiApp = require('cica-online-api')(app, config);
// const questionnaireSectionApp = require('cica-online-questionnaire-section-app')(app, config);
// //const accountSectionApp = require('cica-online-account-section');
// const applicationSectionApp = require('cica-online-application-section');

// app.use('/', questionnaireSectionApp);
// app.use('/', apiApp);
// app.use('/account', accountSectionApp);
// app.use('/application', applicationSectionApp);

/* ******************************************** */
/* * EXPOSE                                   * */
/* ******************************************** */

const port = 3000;

app.listen(port, () => {
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
    // eslint-disable-next-line no-console
    console.log(
        `\x1b[32m--- CICA Online module app listening on \x1b[4m${port}\x1b[24m ---\x1b[0m`
    );
});
