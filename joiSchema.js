const baseJoi = require('joi')
const sanitizeHTML = require('sanitize-html')


// Definig Joi EXTENSION to prevent adding of script inside req.body
const extension = (baseJoi) => ({
    type: 'string',
    base: baseJoi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }
})
const Joi = baseJoi.extend(extension)

// Define JOI schema to validate the form
module.exports.campJoiSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    deleteImages: Joi.array()

})


module.exports.reviewJoiSchema = Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5)
}).required()