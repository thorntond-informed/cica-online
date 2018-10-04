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

    qrouter.previous();
    const previousSectionId = qrouter.getCurrentState().value;
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
        let sectionId = qrouter.getCurrentState().value;
        sectionId = sectionId.replace('p--', '').replace('p-', '');
        return res.redirect(`/${questionnaireId}/${questionnaireName}/${sectionId}`);
    }

    return redirectRequest(questionnaireId);
});

router.get('/:questionnaireId/:questionnaireName/:sectionId*?', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    let savedAnswers;

    async function renderPage(qId) {
        if (!qrouter) {
            const questionnaireData = await questionnaireService.getQuestionnaireById(qId);
            qrouter = qRouter(questionnaireData);
        }
        savedAnswers = qrouter.extendedState.answers;
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

        return res.render('questionnaire', {
            questionnaireId,
            questionnaireName,
            absoluteSectionId,
            sectionId,
            formAction: `/${questionnaireId}/${questionnaireName}/${sectionId}`,
            formHtml: jsonSchemaToX.toForm(
                questionnaireSectionData,
                questionSectionUISchema,
                absoluteSectionId,
                savedAnswers
            )
        });
    }
    return renderPage(questionnaireId);
});

router.post('/:questionnaireId/:questionnaireName/:sectionId', (req, res) => {
    const { questionnaireId } = req.params;
    const { questionnaireName } = req.params;
    const { sectionId } = req.params;
    const reqBody = req.body;
    const currentSectionId = qrouter.getCurrentState().value || sectionId;
    const savedAnswers = qrouter.extendedState.answers;

    async function validateFormResponse() {
        const validationResponse = await questionnaireService.postQuestionnaireSectionById(
            questionnaireId,
            currentSectionId,
            reqBody
        );

        const questionnaireSectionData = await questionnaireService.getQuestionnaireSectionById(
            questionnaireId,
            currentSectionId
        );
        const questionSectionUISchema = await questionnaireService.getUISchemaById(
            currentSectionId
        );

        if (validationResponse.valid) {
            qrouter.next('ANSWER', reqBody);
            let nextSectionId = qrouter.getCurrentState().value;
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
            currentSectionId,
            formAction: `/${questionnaireId}/${questionnaireName}/${currentSectionId}`,
            formHtml: jsonSchemaToX.toForm(
                questionnaireSectionData,
                questionSectionUISchema,
                currentSectionId,
                savedAnswers,
                reqBody,
                validationResponse
            ),
            formErrors: errorSummaryData
        });
    }

    return validateFormResponse();
});

module.exports = router;
