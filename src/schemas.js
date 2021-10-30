const Joi = require('joi');

const requestSchema = Joi.object({
    uid: Joi.string()
        .trim()
        .min(5)
        .required(),
})
// export the schemas
module.exports = {
    requestSchema: requestSchema
};