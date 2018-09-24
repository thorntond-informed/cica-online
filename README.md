# CICA Online MVP
## considerations
 * Express set up / Project structure
     * sub-app for modules - self contain controllers/models/views
     * https://derickbailey.com/2016/02/17/using-express-sub-apps-to-keep-your-code-clean/
     * http://justjs.com/posts/creating-reusable-express-modules-with-their-own-routes-views-and-static-assets
 * Swagger 3.0
     * contract first
 * Swagger/JSON Schema issue (https://philsturgeon.uk/api/2018/04/13/openapi-and-json-schema-divergence-solved/)
 * JSON schema to form
 * JSON schema model validation
 * Persisting data to PostgreSQL
 * Liquibase
     * Benefits?
 * Logic
     * Next/Previous
     * Representation of Logic (http://jsonlogic.com/)
     * Determine if routing question had been changed
 * PDF Generation
  * Uploads
     * Virus scanning
     * Document storage
* Code reuse pattern(s) e.g. classes / object.freeze
 * Build tool
     * https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
     * https://css-tricks.com/using-npm-build-tool/
 * Transpiles ES6 on client
 * Node version async/await
 * docker compose??
 * In page question dependencies
 * Separate UI schema
 * html in json
 * Base node module / express project with testing, linting, etc
 * Look at COSL board
 * Look at tech recommendations in beta report

# References

## JSON Schema docs/resources

 * https://mozilla-services.github.io/react-jsonschema-form/
 * https://www.jsonschemavalidator.net/
 * https://github.com/americanexpress/jest-json-schema

## Another Javscript Validator

 * https://github.com/epoberezkin/ajv


---

## Notes

### Pre-build taks
 * ~~install speccy globally `npm install speccy -g --save`~~


### Calling a dependency's NPM Script
* We have the ability to call a dependency's npm scripts by installing 'npm-explore' in the 'parent'.
* This repo has a script called 'speccy' that calls 'cica-online-api' npm script called 'speccy'.
* https://stackoverflow.com/questions/30989972/how-do-i-run-an-npm-script-of-a-dependent-package
* https://docs.npmjs.com/cli/explore