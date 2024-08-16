const Joi = require("joi");

const allowedCategories = [
    'Urban', 'City', 'Mountain', 'Beach', 'Historic', 'Nature',
    'Lake', 'Ski', 'Safari', 'Island', 'Countryside', 'Tropical', 'Desert'
];

module.exports.listingSchema = Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        }).optional(),
        category: Joi.array()
            .items(Joi.string().valid(...allowedCategories)) // Each item must be one of the allowed categories
            .min(1) // Ensure the array has at least one category
            .required() // Ensure the categories field is required
    }).required()
}) 

module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required()
})