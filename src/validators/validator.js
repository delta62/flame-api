const Joi = require('joi')
const { BadRequestError } = require('restify')

const opts = {
  convert:      false,
  allowUnknown: true,
  stripUnknown: true,
  presence:     'required'
}

function validate(schema, val) {
  return new Promise((resolve, reject) => {
    Joi.validate(val, schema, opts, (err, validated) => {
      if (err) {
        const badRequestError = new BadRequestError(err.message)
        reject(badRequestError)
      }
      else resolve(validated)
    })
  })
}

module.exports = { validate }
