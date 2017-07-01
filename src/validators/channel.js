const Joi          = require('joi')
const { validate } = require('./validator')

const schema = Joi.object().keys({
  state: Joi.boolean(),
  lockId: Joi.string()
})

module.exports = {
  validate: validate.bind(validate, schema)
}
