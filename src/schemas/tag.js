const joi = require('joi')

const tagSchema = joi.object({
    name: joi.string()
        .max(40)
        .required(),
    sortOrder: joi.number()
        .integer()
        .default(0)
})

const tagSchemaOptional = joi.object({
    name: joi.string()
        .max(40),
    sortOrder: joi.number()
        .integer()
})

module.exports = { tagSchema, tagSchemaOptional }