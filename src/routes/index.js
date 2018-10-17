const express = require('express');

const router = express.Router();
const jsonSchemaToX = require('json-schema-to-x');
const questionnaireService = require('questionnaire-service')();
const qRouter = require('q-router');

let qrouter; // TEMP: db cache. TODO: implement database.

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

    const previousSectionId = qrouter.previous();
    const previousSectionIdFormatted = previousSectionId.replace('p--', '').replace('p-', '');

    return res.redirect(`/${questionnaireId}/${questionnaireName}/${previousSectionIdFormatted}`);
});

router.get('/:questionnaireId/:questionnaireName', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;

    async function redirectRequest(qId) {
        if (!qrouter) {
            const questionnaireData = await questionnaireService.getQuestionnaireById(qId);
            qrouter = qRouter(questionnaireData);
        }
        let sectionId = qrouter.current();
        sectionId = sectionId.replace('p--', '').replace('p-', '');
        return res.redirect(`/${questionnaireId}/${questionnaireName}/${sectionId}`);
    }

    return redirectRequest(questionnaireId);
});

router.get('/:questionnaireId/:questionnaireName/:sectionId/:pageNumber?', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    const { pageNumber } = req.params;
    let savedAnswers;

    async function renderPage(qId) {
        if (!qrouter) {
            const questionnaireData = await questionnaireService.getQuestionnaireById(qId);
            qrouter = qRouter(questionnaireData);
        }
        savedAnswers = qrouter.questionnaire.answers;
        const questionnaireSectionIds = await questionnaireService.getQuestionnaireSectionsIdsByQuestionnaireId(
            qId
        );

        // get all sections
        // check if --blah, then check if -blah exists.

        // questionnaire section IDs can be in 2 formats:
        // 'q--crime-reference', and 'q-applicant-name'.
        // the first is not namespaced and is a generic schema, and is
        // person-unspecific. the second is namespaced to the person it
        // pertains to (i.e 'applicant'). take 'sectionId' and make sure
        // it corrisponds to a section we have defined.
        let absoluteSectionId;
        // does it conform to the non-namespaced format?
        if (questionnaireSectionIds.includes(`p--${sectionId}`)) {
            absoluteSectionId = `p--${sectionId}`;
            // does it conform to the namespaced format?
        } else if (questionnaireSectionIds.includes(`p-${sectionId}`)) {
            absoluteSectionId = `p-${sectionId}`;
        }

        const questionnaireSectionData = await questionnaireService.getQuestionnaireSectionById(
            questionnaireId,
            absoluteSectionId
        );
        const questionSectionUISchema = await questionnaireService.getUISchemaById(
            absoluteSectionId
        );

        let formAction = `/${questionnaireId}/${questionnaireName}/${sectionId}/`;
        if (pageNumber) {
            formAction = `${formAction}${pageNumber}`;
        }
        console.log('====================================');
        console.log(qrouter.questionnaire.answers);

        return res.render('questionnaire', {
            questionnaireId,
            questionnaireName,
            absoluteSectionId,
            sectionId,
            formAction,
            formHtml: jsonSchemaToX.toForm({
                formData: questionnaireSectionData,
                uiSchema: questionSectionUISchema,
                sectionId: absoluteSectionId,
                savedAnswers
            })
        });
    }
    return renderPage(questionnaireId);
});

router.post('/:questionnaireId/:questionnaireName/:sectionId/:pageNumber?', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    const { pageNumber } = req.params;
    const reqBody = req.body;
    const savedAnswers = qrouter.questionnaire.answers;

    async function validateFormResponse() {
        let absoluteSectionId;

        const questionnaireSectionIds = await questionnaireService.getQuestionnaireSectionsIdsByQuestionnaireId(
            questionnaireId
        );

        if (questionnaireSectionIds.includes(`p--${sectionId}`)) {
            absoluteSectionId = `p--${sectionId}`;
        } else if (questionnaireSectionIds.includes(`p-${sectionId}`)) {
            absoluteSectionId = `p-${sectionId}`;
        }

        const questionnaireSectionData = await questionnaireService.getQuestionnaireSectionById(
            questionnaireId,
            absoluteSectionId
        );
        const questionSectionUISchema = await questionnaireService.getUISchemaById(
            absoluteSectionId
        );
        const validationResponse = await questionnaireService.postQuestionnaireSectionById(
            questionnaireId,
            absoluteSectionId,
            reqBody
        );

        if (pageNumber) {
            absoluteSectionId = `${absoluteSectionId}/${pageNumber}`;
        }

        if (validationResponse.valid) {
            let nextSectionId = qrouter.next('ANSWER', reqBody, absoluteSectionId);
            nextSectionId = nextSectionId.replace('p--', '').replace('p-', '');
            return res.redirect(`/${questionnaireId}/${questionnaireName}/${nextSectionId}`);
        }

        // process the errors if there are some.
        // we need to create a shape of error date that will work for the nunjucks template.
        const errorSummaryData = Object.entries(validationResponse).map(([href, text]) => ({
            href: `#${href}`,
            text
        }));

        return res.render('questionnaire', {
            questionnaireId,
            questionnaireName,
            sectionId,
            formAction: `/${questionnaireId}/${questionnaireName}/${sectionId}`,
            formHtml: jsonSchemaToX.toForm({
                formData: questionnaireSectionData,
                uiSchema: questionSectionUISchema,
                sectionId: absoluteSectionId,
                savedAnswers,
                formErrors: validationResponse
            }),
            formErrors: errorSummaryData
        });
    }

    return validateFormResponse();
});

module.exports = router;
