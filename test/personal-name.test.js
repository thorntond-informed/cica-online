const Ajv = require('ajv');
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
const fs = require('fs');

describe('validating personal information', () => {

    beforeAll((done) => {
        fs.readFile('schema/personal-name.json', 'utf8', function (err, schemaData) {
            if (err) {
                return console.log(err);
            }
            ajv.addSchema(JSON.parse(schemaData), 'personalInfoSchema');
            done();

        });
    });

    test('allow only: firstName, lastName', () => {

        const inputJson = {
            "firstName": "adrian",
            "lastName": "roworth"
        };

        let valid = ajv.validate('personalInfoSchema', inputJson);
        expect(valid).toBe(true);
    });

    test('allow firstName, lastName, age, bio, password, telephone', () => {

        const inputJson = {
            "firstName": "adrian",
            "lastName": "roworth",
            "age": 30,
            "bio": "a man",
            "password": "myPassword",
            "telephone": "0141 1234567",
        };

        let valid = ajv.validate('personalInfoSchema', inputJson);
        expect(valid).toBe(true);
    });

});