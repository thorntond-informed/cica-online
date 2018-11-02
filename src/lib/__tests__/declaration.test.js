const schemaService = require('../../src/services/schemaService');

describe('When using the schemaService', () => {
    // beforeEach(() => {
    //     return 'blah';
    // });

    test('returns a schema by ID', () => {
        const schema = schemaService.getSchemaById('declaration');
        const declarationSchema = {
            $schema: 'http://json-schema.org/draft-04/schema',
            id: 'http://localhost:3000/schema/definitions/nationality',
            'x-uri': '/nationality',
            title: 'Form',
            type: 'object',
            additionalProperties: false,
            required: ['declaration'],
            properties: {
                declaration: {
                    type: 'boolean',
                    title: 'Do you agree'
                }
            }
        };
        expect(schema).toEqual(declarationSchema);
    });

    test('returns a UI schema by ID', () => {
        const schema = schemaService.getUISchemaById('declaration');
        const declarationSchema = {
            declaration: {
                'ui:widget': 'radios',
                'ui:title': 'Do you agree?',
                'ui:hint': 'Do you agree with the above statement?',
                'ui:attr': {
                    autofocus: 'true'
                }
            }
        };
        expect(schema).toEqual(declarationSchema);
    });

    test('validate form data against a schema', () => {
        const declarationRequestBody = {
            declaration: true
        };
        const response = schemaService.postSchemaById('declaration', declarationRequestBody);
        expect(response).toEqual({ valid: true });
    });

    test('returns a questionnaire schema by ID', () => {
        const schema = schemaService.getQuestionnaireById('abcdef123456');
        const applyForCompensationSchema = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            id: 'http://localhost:3000/schema/questionnaires/appy-for-compensation',
            title: 'test',
            'x-uri': 'test',
            'x-instanceId': 'abcdef123456',
            type: 'object',
            required: ['pages'],
            additionalProperties: false,
            properties: {
                pages: {
                    type: 'array',
                    additionalItems: false,
                    minItems: 7,
                    maxItems: 7,
                    items: [
                        {
                            $ref: '../definitions/have-you-changed-your-name.json'
                        },
                        {
                            $ref: '../definitions/nationality.json'
                        },
                        {
                            $ref: '../definitions/personal-info.json'
                        },
                        {
                            $ref: '../definitions/personal-injury.json'
                        },
                        {
                            $ref: '../definitions/where-do-you-live.json'
                        },
                        {
                            $ref: '../definitions/your-name.json'
                        }
                    ]
                }
            }
        };
        expect(schema).toEqual(applyForCompensationSchema);
    });

    test('returns a questionnaire schema pages by ID', () => {
        const schema = schemaService.getQuestionnairePagesByQuestionnaireId('abcdef123456');
        const applyForCompensationPagesSchema = [
            {
                $ref: '../definitions/have-you-changed-your-name.json'
            },
            {
                $ref: '../definitions/nationality.json'
            },
            {
                $ref: '../definitions/personal-info.json'
            },
            {
                $ref: '../definitions/personal-injury.json'
            },
            {
                $ref: '../definitions/where-do-you-live.json'
            },
            {
                $ref: '../definitions/your-name.json'
            }
        ];
        expect(schema).toEqual(applyForCompensationPagesSchema);
    });

    test('returns a questionnaire schema page by ID', () => {
        const schema = schemaService.getQuestionnairePageById('abcdef123456', 'where-do-you-live');
        const applyForCompensationPageSchema = {
            $schema: 'http://json-schema.org/draft-04/schema',
            id: 'http://localhost:3000/schema/definitions/where-do-you-live',
            'x-uri': '/where-do-you-live',
            title: 'Where do you live?',
            type: 'object',
            additionalProperties: false,
            required: ['where-do-you-live'],
            properties: {
                'where-do-you-live': {
                    title: 'Where do you live?',
                    description: 'Where do you call home?',
                    type: 'string',
                    items: {
                        oneOf: [
                            {
                                title: 'England',
                                enum: ['england']
                            },
                            {
                                title: 'Scotland',
                                enum: ['scotland']
                            },
                            {
                                title: 'Wales',
                                enum: ['wales']
                            },
                            {
                                title: 'Northern Ireland',
                                enum: ['northern-ireland']
                            }
                        ]
                    }
                }
            }
        };
        expect(schema).toEqual(applyForCompensationPageSchema);
    });

    test('validate form data against a questionnaire page schema', () => {
        const requestBody = {
            'where-do-you-live': 'scotland'
        };
        const response = schemaService.postQuestionnairePageById(
            'abcdef123456',
            'where-do-you-live',
            requestBody
        );
        expect(response).toEqual({ valid: true });
    });
});

// const Ajv = require('ajv');

// const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
// ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
// const fs = require('fs');

// describe('validating declaration schema', () => {
//     beforeAll(done => {
//         fs.readFile('schema/definitions/declaration.json', 'utf8', (err, schemaData) => {
//             if (err) {
//                 throw err;
//             }
//             ajv.addSchema(JSON.parse(schemaData), 'declarationSchema');
//             done();
//         });
//     });

//     test('allow: true', () => {
//         const inputJson = {
//             declaration: true
//         };

//         const valid = ajv.validate('declarationSchema', inputJson);
//         expect(valid).toBe(true);
//     });

//     test('allow: false', () => {
//         const inputJson = {
//             declaration: false
//         };

//         const valid = ajv.validate('declarationSchema', inputJson);
//         expect(valid).toBe(true);
//     });

//     test('disallow additional properties', () => {
//         const inputJson = {
//             declaration: true,
//             anotherProperty: 'something'
//         };

//         const valid = ajv.validate('declarationSchema', inputJson);
//         expect(valid).not.toBe(true);
//     });

//     test('declaration is required', () => {
//         const inputJson = {};

//         const valid = ajv.validate('declarationSchema', inputJson);
//         expect(valid).not.toBe(true);
//     });
// });
