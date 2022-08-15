const Joi = require('joi')

const fullUserSchema = Joi.object({
    email: Joi.string()
        .max(100)
        .email()
        .required(),
    password: Joi.string()
        .pattern(new RegExp(/\S{8,}/))
        .pattern(new RegExp(/\S*[A-Z]\S*/, 's'))
        .pattern(new RegExp(/\S*[a-z]\S*/, 's'))
        .pattern(new RegExp(/\S*[0-9]\S*/, 's'))
        .required(),
    nickname: Joi.string()
        .max(100)
        .alphanum()
        .required()
})

const fullUserSchemaOptional = Joi.object({
    email: Joi.string()
        .max(100)
        .email(),
    password: Joi.string()
        .pattern(new RegExp(/\S{8,}/))
        .pattern(new RegExp(/\S*[A-Z]\S*/, 's'))
        .pattern(new RegExp(/\S*[a-z]\S*/, 's'))
        .pattern(new RegExp(/\S*[0-9]\S*/, 's')),
    nickname: Joi.string()
        .max(100)
        .alphanum()
})

const emailPassUserSchema = Joi.object({
    email: Joi.string()
        .max(100)
        .email()
        .required(),
    password: Joi.string()
        .pattern(new RegExp(/\S{8,}/))
        .pattern(new RegExp(/\S*[A-Z]\S*/, 's'))
        .pattern(new RegExp(/\S*[a-z]\S*/, 's'))
        .pattern(new RegExp(/\S*[0-9]\S*/, 's'))
        .required()
})

module.exports = { fullUserSchema, fullUserSchemaOptional, emailPassUserSchema }