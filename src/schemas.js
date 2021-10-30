const Joi = require('joi');

const requestSchema = Joi.object({
    UID: Joi.string()
        .trim()
        .min(5)
        .required(),
})
// export the schemas
module.exports = {
    requestSchema: requestSchema
};