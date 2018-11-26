const path = require('path');
require('dotenv').config();

const rootPath = path.resolve(__dirname, '../');

module.exports = {
    root: rootPath,
    cica: {
        defaults: {},
        services: {
            online: JSON.parse(process.env.CICA_SERVICE_ONLINE),
            dataCapture: JSON.parse(process.env.CICA_SERVICE_DATA_CAPTURE)
        },
        test: JSON.parse(process.env.CICA_TEST)
    },
    views: {
        locals: {
            google: {
                analytics: JSON.parse(process.env.GOOGLE_ANALYTICS)
            }
        }
    }
};

// const path = require('path');

// const rootPath = path.resolve(__dirname, '../');
// const env = process.env.NODE_ENV || 'development';

// const config = {
//     development: {
//         root: rootPath,
//         app: {
//             name: 'CICA Online DEVELOPMENT ENVIRONMENT'
//         },
//         port: process.env.PORT || 1234,
//         db: 'postgres://localhost/project-base-development'
//     },

//     test: {
//         root: rootPath,
//         app: {
//             name: 'CICA Online TEST ENVIRONMENT'
//         },
//         port: process.env.PORT || 1234,
//         db: 'postgres://localhost/project-base-test'
//     },

//     production: {
//         root: rootPath,
//         app: {
//             name: 'CICA Online'
//         },
//         port: process.env.PORT || 1234,
//         db: 'postgres://localhost/project-base-production'
//     }
// };

// module.exports = config[env];
