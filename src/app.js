const express = require('express');
const config = require('./app/config/config');
const path = require('path');
const routes = require('./app/routes/index');

let app = express();
app = require('./app/config/express')(app, config);

/* ******************************************** */
/* * SUB APPS                                 * */
/* ******************************************** */

app.use('/', express.static(path.resolve(__dirname, './public')));

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
    console.log(
        `\x1b[32m--- CICA Online module app listening on \x1b[4m${port}\x1b[24m ---\x1b[0m`
    );
});
