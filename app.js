const express = require('express');
const config = require('./src/config/config');
const path = require('path');
const nunjucks = require('nunjucks');
const routes = require('./src/routes/index');

let app = express();
app = require('./src/config/express')(app, config);

/* ******************************************** */
/* * SUB APPS                                 * */
/* ******************************************** */

app.use('/', express.static(path.resolve(__dirname, './public')));

nunjucks.configure(path.resolve(__dirname, './src/views'), {
    autoescape: true,
    express: app
});

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

app.listen(3000, () => {
    console.log(`Base module app listening on port 3000`);
});
