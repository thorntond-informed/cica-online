(function($, window, document, undefined) {
    // $.fn.deserialize = function (serializedString) {
    //     var $form = $(this);
    //     $form[0].reset();
    //     serializedString = serializedString.replace(/\+/g, '%20');
    //     var formFieldArray = serializedString.split("&");
    //     $.each(formFieldArray, function (i, pair) {
    //         var nameValue = pair.split("=");
    //         var name = decodeURIComponent(nameValue[0]);
    //         var value = decodeURIComponent(nameValue[1]) || '';
    //         console.log(nameValue, name, value);

    //         if(name) {
    //             // Find one or more fields
    //             var $field = $form.find('[name=' + name + ']');

    //             if ($field[0].type == "radio"
    //                 || $field[0].type == "checkbox") {
    //                 var $fieldWithValue = $field.filter('[value="' + value + '"]');
    //                 var isFound = ($fieldWithValue.length > 0);
    //                 if (!isFound && value == "on") {
    //                     $field.first().prop("checked", true);
    //                 } else {
    //                     $fieldWithValue.prop("checked", isFound);
    //                 }
    //             } else {
    //                 $field.val(value);
    //             }
    //         }
    //     });
    // }

    function sanatiseData(formData) {
        const convertedData = formData;
        Object.keys(convertedData).forEach(key => {
            if (convertedData[key] === 'true') {
                convertedData[key] = true;
            }

            if (convertedData[key] === 'false') {
                convertedData[key] = false;
            }

            if (
                !Number.isNaN(convertedData[key]) &&
                Number.isFinite(Number.parseInt(convertedData[key], 10))
            ) {
                convertedData[key] = Number.parseInt(convertedData[key], 10);
            }
        });

        return convertedData;
    }

    function getFormData(form) {
        // var $form = $(form);
        // var deserializedForm = $form.deserialize($form.serialize());
        const params = {};
        // console.log($(form).serialize());
        // // if(form.elements) {
        for (let i = 0; i < form.elements.length; i++) {
            const fieldName = form.elements[i].name;
            var fieldValue;

            if (fieldName) {
                // radio/checkbox.
                if (form.elements[i].type === 'radio') {
                    if (form.elements[i].checked === true) {
                        fieldValue = form.elements[i].value;
                        params[fieldName] = fieldValue;
                        continue;
                    } else {
                        fieldValue = '';
                        params[fieldName] = fieldValue;
                    }
                } else {
                    // anything else.
                    fieldValue = form.elements[i].value;
                    params[fieldName] = fieldValue;
                }

                params[fieldName] = fieldValue;
            }
        }
        return params;
    }

    function getSchemaDefinition(schemaName, callback) {
        $.get(`/api/v1/schema/${schemaName}`, data => {
            callback(data);
        });
    }

    function beautifyErrors(validationErrors) {
        return validationErrors.map(item => ({
            href: `#${item.dataPath.replace('/', '')}`,
            text: item.message
        }));
    }

    function init() {
        const form = $('#questionnaire-form');
        form.find('[type="submit"]').on('click', e => {
            e.preventDefault(e);
            const formData = getFormData(form[0]);
            let schemaToGet = window.location.href.split('/');
            schemaToGet = schemaToGet[schemaToGet.length - 1];
            getSchemaDefinition(schemaToGet, schema => {
                // $.get('http://json-schema.org/draft-04/schema', function(schema4Data) {
                getSchemaDefinition('json-schema-draft-04', schema4Data => {
                    const ajv = new Ajv({
                        schemaId: 'id', // draft-04 support requirment.
                        allErrors: true,
                        jsonPointers: true
                    });

                    ajv.addMetaSchema(schema4Data);

                    const validate = ajv.compile(schema);
                    const valid = validate(formData);
                    let firstErrorElementId;

                    // clear form errors to render new ones.
                    $('.govuk-error-summary').remove();
                    $('.govuk-form-group')
                        .removeClass('govuk-form-group--error')
                        .find('input')
                        .removeClass('govuk-input--error')
                        .end()
                        .find('.govuk-error-message')
                        .remove();

                    console.log(valid);

                    if (!valid) {
                        e.preventDefault(e);

                        // add the new errors, if there are any.
                        $('#main-content').prepend(() => {
                            let html =
                                '<div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabindex="-1" data-module="error-summary">' +
                                '<h2 class="govuk-error-summary__title" id="error-summary-title">' +
                                'There is a problem' +
                                '</h2>' +
                                '<div class="govuk-error-summary__body">' +
                                '<ul class="govuk-list govuk-error-summary__list">';
                            beautifyErrors(validate.errors).forEach(item => {
                                // console.log("item.href: ", item.href);
                                // console.log("item.text: ", item.text);

                                if (!firstErrorElementId) {
                                    firstErrorElementId = item.href;
                                }
                                html += `<li><a href="${item.href}">${item.text}</a></li>`;
                                const element = $(item.href);

                                // add error class to element.
                                element.addClass('govuk-input--error');

                                // add the error label.
                                element.before(
                                    `<span id="${item.href.replace(
                                        '#',
                                        ''
                                    )}-error" class="govuk-error-message">${item.text}</span>`
                                );

                                // add error class to parent group element.
                                element
                                    .parents('.govuk-form-group')
                                    .addClass('govuk-form-group--error');
                            });

                            html += '</ul>' + '</div>' + '</div>';
                            return html;
                        });

                        $(firstErrorElementId).focus();
                        return false;
                    }
                    form.submit();
                });
            });
            return false;
        });
    }

    // init();
})(jQuery, window, document);
