const express = require('express');

const router = express.Router();
const jsonSchemaToX = require('json-schema-to-x');
const questionnaireService = require('questionnaire-service')();
const qRouter = require('q-router');

let currentQuestionnaireId; // crude cache to get the router example to work.
let qrouter;

// const questionnaireService = require('../services/questionnaireService');
// const logger = require('morgan');

router.get('/', (req, res) => res.status(200).render('error'));

router.get('/check-your-answers/:questionnaireId/:questionnaireName', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;

    return res.render('check-your-answers', {
        questionnaireId,
        questionnaireName
    });
});

router.get('/:questionnaireId/:questionnaireName/previous', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;

    return questionnaireService.getQuestionnaireById(questionnaireId).then(questionnaireData => {
        if (!currentQuestionnaireId) {
            currentQuestionnaireId = questionnaireId;
            qrouter = qRouter(questionnaireData);
        }
        qrouter.previous();
        const previousSectionId = qrouter.getCurrentState().value;
        let previousSectionIdFormatted = previousSectionId.replace('p--', '');
        previousSectionIdFormatted = previousSectionIdFormatted.replace('p-', '');

        return res.redirect(
            `/${questionnaireId}/${questionnaireName}/${previousSectionIdFormatted}`
        );
    });
});

// router.get('/:questionnaireId/:questionnaireName/next', (req, res) => {

// });

router.get('/:questionnaireId/:questionnaireName?/:sectionId?', (req, res) => {
    const url = req.originalUrl;
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;

    // if a specific section of a specific questionnaire is being requested...
    if (questionnaireId && questionnaireName && sectionId) {
        if (sectionId === 'none') {
            return res.redirect(`/check-your-answers/${questionnaireId}/${questionnaireName}`);
        }

        return (
            questionnaireService
                // get all the section IDs defined within this questionnaire.
                .getQuestionnaireSectionsIdsByQuestionnaireId(questionnaireId)
                .then(sectionIds => {
                    // get all sections
                    // check if -blah, then check if --blah exists.

                    // questionnaire section IDs can be in 2 formats:
                    // 'q-applicant-name', and 'q--crime-reference'.
                    // the first is namespaced to the person it pertains to (i.e 'applicant').
                    // the second is not namespaced and is a generic schema, and is
                    // person-unspecific.
                    // take 'sectionId' and make sure it corrisponds to a section we have defined.
                    let absoluteSectionId;
                    // does it conform to the namespaced format?
                    if (sectionIds.includes(`p-${sectionId}`)) {
                        absoluteSectionId = `p-${sectionId}`;
                        // does it conform to the non-namespaced format?
                    } else if (sectionIds.includes(`p--${sectionId}`)) {
                        absoluteSectionId = `p--${sectionId}`;
                    }
                    return absoluteSectionId;
                })
                .then(absoluteSectionId => {
                    const promises = [
                        questionnaireService.getQuestionnaireSectionById(
                            questionnaireId,
                            absoluteSectionId
                        ),
                        questionnaireService.getUISchemaById(absoluteSectionId) // ,
                        // questionnaireService.getPreviousQuestionnaireSectionIdById(questionnaireId, absoluteSectionId)
                    ];

                    return Promise.all(promises)
                        .then(results => {
                            const schema = results[0];
                            const uiSchema = results[1];
                            // const previousSectionInfo = results[2];

                            return res.render('questionnaire', {
                                // previousSectionId: previousSectionInfo.absoluteSectionId,
                                questionnaireId,
                                questionnaireName,
                                absoluteSectionId,
                                sectionId,
                                formAction: `${url}`,
                                formHtml: jsonSchemaToX.toForm(schema, uiSchema)
                            });
                        })
                        .catch(err => {
                            console.log('HEllo: ', err);
                            res.status(404).render('404', err);
                            // throw err;
                            // logger.log('error', err);
                        });
                })
        );

        // if a specific questionnaire is being requested, serve
        // the first section of that questionnaire.
    } else if (questionnaireId && questionnaireName && !sectionId) {
        return (
            questionnaireService
                .getQuestionnaireSectionsByQuestionnaireId(questionnaireId)
                // .catch(err => {
                //     return res.status(404).render('error', {error: err});
                // })
                .then(sections => {
                    // extract the schema file name from the JSON.
                    const schemaFilePath = sections[0].match(/^.*\/(.*)\.\w+$/)[1];
                    return schemaFilePath;
                })
                .then(questionnaireSectionId =>
                    res.redirect(
                        `/${questionnaireId}/${questionnaireName}/${questionnaireSectionId}`
                    )
                )
                .catch(
                    err => res.status(404).render('404', err)
                    // throw err;
                    // logger.log('error', err);
                )
        );
    }

    return res.status(404).render('error');
});

router.post('/:questionnaireId/:questionnaireName?/:sectionId?', (req, res) => {
    const url = req.originalUrl;
    const reqBody = req.body;
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;

    return (
        questionnaireService
            // get all the section IDs defined within this questionnaire.
            .getQuestionnaireSectionsIdsByQuestionnaireId(questionnaireId)
            .then(sectionIds => {
                let absoluteSectionId;
                // does it conform to the namespaced format?
                if (sectionIds.includes(`p-${sectionId}`)) {
                    absoluteSectionId = `p-${sectionId}`;
                    // does it conform to the non-namespaced format?
                } else if (sectionIds.includes(`p--${sectionId}`)) {
                    absoluteSectionId = `p--${sectionId}`;
                }
                return absoluteSectionId;
            })
            .then(absoluteSectionId => {
                const promises = [
                    questionnaireService.getQuestionnaireSectionById(
                        questionnaireId,
                        absoluteSectionId
                    ),
                    questionnaireService.postQuestionnaireSectionById(
                        questionnaireId,
                        absoluteSectionId,
                        reqBody
                    ),
                    questionnaireService.getUISchemaById(absoluteSectionId)
                ];
                return Promise.all(promises)
                    .then(result => {
                        const schema = result[0];
                        const validationResult = result[1];
                        const uiSchema = result[2];
                        let errorSummaryData;

                        // if valid, go to next section.
                        if (validationResult.valid) {
                            return questionnaireService
                                .getQuestionnaireById(questionnaireId)
                                .then(questionnaireData => {
                                    if (!currentQuestionnaireId) {
                                        currentQuestionnaireId = questionnaireId;
                                        qrouter = qRouter(questionnaireData);
                                    }
                                    return qrouter;
                                })
                                .then(qr => {
                                    qr.next('ANSWER', reqBody);
                                    const nextSectionId = qr.getCurrentState().value;
                                    let nextSectionIdFormatted = nextSectionId.replace('p--', '');
                                    nextSectionIdFormatted = nextSectionIdFormatted.replace(
                                        'p-',
                                        ''
                                    );

                                    return res.redirect(
                                        `/${questionnaireId}/${questionnaireName}/${nextSectionIdFormatted}`
                                    );
                                });
                        }

                        // process the errors if there are some.
                        if (!validationResult.valid) {
                            // we need to create a shape of error date that will work for the nunjucks template.
                            errorSummaryData = Object.entries(validationResult).map(
                                ([href, text]) => ({
                                    href: `#${href}`,
                                    text
                                })
                            );
                        }

                        return res.render('questionnaire', {
                            questionnaireId,
                            questionnaireName,
                            sectionId,
                            formAction: `${url}`,
                            formHtml: jsonSchemaToX.toForm(
                                schema,
                                uiSchema,
                                reqBody,
                                validationResult
                            ),
                            formErrors: errorSummaryData
                        });
                    })
                    .catch(err => {
                        throw err;
                        // logger.log('error', err);
                    });
            })
    );
});

// router.post('/:questionnaireId/:questionnaireName?/nextsection/:sectionId?', (req, res) => {
//     const url = req.originalUrl;
//     const { questionnaireId } = req.params;
//     const { questionnaireName } = req.params;
//     const { sectionId } = req.params;

//     if (questionnaireId && questionnaireName && sectionId) {
//         return questionnaireService.getNextQuestionnaireSectionIdById(questionnaireId, sectionId)
//             .then(nextSectionId => {
//                 return nextSectionId;
//             })
//             .catch(
//                 err => {
//                     return res.status(404).render('404');
//                 // throw err;
//                 // logger.log('error', err);
//             });
//     }

//     return res.status(404).render('error');
// });

// router.get('/:url(*)', function(req, res, next) {
//     const url = req.params.url;
//     let deconstructedUrl = questionnaireService.deconstructUrl(url);
//     if(!deconstructedUrl) {
//         return next();
//     }
//     return questionnaireService.getQuestionnaireSectionById(deconstructedUrl.questionnaireId, deconstructedUrl.sectionId)
//         .then(schema => {
//             return res.render('questionnaire', {
//                 formAction: `/${url}`,
//                 formHtml: jsonSchemaToX.toForm(schema)
//             });
//         })
//         .catch(err => {
//             console.log(err);
//         });
// });

// router.post('/:url(*)', function(req, res, next) {
//     const url = req.params.url;
//     const reqBody = req.body;
//     let deconstructedUrl = questionnaireService.deconstructUrl(url);
//     if(!deconstructedUrl) {
//         return next();
//     }
//     let promises = [
//         schema = questionnaireService.getQuestionnaireSectionById(deconstructedUrl.questionnaireId, deconstructedUrl.sectionId),
//         response = questionnaireService.postQuestionnaireSectionById(deconstructedUrl.questionnaireId, deconstructedUrl.sectionId, reqBody)
//     ]
//     return Promise.all(promises)
//         .then(result => {
//             console.log(result);
//             return res.render('questionnaire', {
//                 formAction: `/${url}`,
//                 formHtml: jsonSchemaToX.toForm(result[0], reqBody),
//                 formErrors: result[1].validationResult.valid ? '' : result[1].validationResult
//             });
//         })
//         .catch(err => {
//             console.log(err);
//         });
// });

module.exports = router;
