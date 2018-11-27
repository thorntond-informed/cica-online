const express = require('express');

const router = express.Router();
const questionnaireService = require('questionnaire-service')();
const qRouter = require('q-router');
const Page = require('page-renderer');
const schemaParserResolve = require('q-json-schema-parser')().resolve;

let qrouter; // TEMP: db cache. TODO: implement database.

// const logger = require('morgan');

router.get('/', (req, res) => res.render('index', { dateTime: new Date() }));

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
    const page = Page();
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    const { pageNumber } = req.params;
    // let savedAnswers;

    async function renderPage(qId) {
        const questionnaireData = await questionnaireService.getQuestionnaireById(qId);
        if (!qrouter) {
            qrouter = qRouter(questionnaireData);
        }
        // savedAnswers = qrouter.questionnaire.answers;
        const questionnaireSectionIds = Object.keys(questionnaireData.sections);

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

        const questionSectionUISchema = await questionnaireService.getUISchemaById(
            absoluteSectionId
        );

        let formAction = `/${questionnaireId}/${questionnaireName}/${sectionId}/`;
        if (pageNumber) {
            formAction = `${formAction}${pageNumber}`;
        }

        const pageHtml = page.get({
            questionnaire: qrouter.questionnaire,
            sectionId: absoluteSectionId,
            uiSchema: questionSectionUISchema,
            formAction,
            questionnaireId,
            questionnaireName,
            context: absoluteSectionId === 'p--summary' ? 'summary' : 'form'
        });

        return res.send(pageHtml);
    }
    return renderPage(questionnaireId);
});

router.post('/:questionnaireId/:questionnaireName/:sectionId/:pageNumber?', (req, res) => {
    const page = Page();
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    const { pageNumber } = req.params;
    const reqBody = req.body;

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

        const questionSectionUISchema = await questionnaireService.getUISchemaById(
            absoluteSectionId
        );

        let formAction = `/${questionnaireId}/${questionnaireName}/${sectionId}/`;
        if (pageNumber) {
            formAction = `${formAction}${pageNumber}`;
        }

        const resolvedReqBody = schemaParserResolve(reqBody, questionSectionUISchema, 'form');

        const validationResponse = await questionnaireService.postQuestionnaireSectionById(
            questionnaireId,
            absoluteSectionId,
            resolvedReqBody
        );

        if (pageNumber) {
            absoluteSectionId = `${absoluteSectionId}/${pageNumber}`;
        }

        if (validationResponse.valid) {
            let nextSectionId = qrouter.next('ANSWER', resolvedReqBody, absoluteSectionId);
            nextSectionId = nextSectionId.replace('p--', '').replace('p-', '');
            return res.redirect(`/${questionnaireId}/${questionnaireName}/${nextSectionId}`);
        }

        // process the errors if there are some.
        // we need to create a shape of error date that will work for the nunjucks template.
        const errorSummaryData = Object.entries(validationResponse).map(([href, text]) => ({
            href: `#${href}`,
            text
        }));

        const pageHtml = page.get({
            questionnaire: qrouter.questionnaire,
            sectionId: absoluteSectionId,
            uiSchema: questionSectionUISchema,
            formAction,
            questionnaireId,
            questionnaireName,
            formErrors: {
                summary: errorSummaryData,
                items: validationResponse
            },
            context: 'form'
        });

        return res.send(pageHtml);
    }

    return validateFormResponse();
});

router.get('*', (req, res) => res.render('404'));

module.exports = router;
