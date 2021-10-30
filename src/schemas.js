const Joi = require("joi");

const requestSchema = Joi.object({
  uid: Joi.string().min(5).required().trim()
});

// export the schemas
module.exports = {
  requestSchema: requestSchema,
};
