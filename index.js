const fs = require('fs')
const readdir = require('util').promisify(fs.readdir)
const mongoose = require('mongoose')

const jsClassProtoFields = ['length', 'prototype', 'name']
const mongooseTypesNames = ['String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed', 'Object', 'ObjectId', 'Array', 'Decimal128','Map']

module.exports = async (opts) => {
  const mongooseConnectionOptions = opts.mongooseConnectionOptions || {}
  await mongoose.connect(opts.databaseConnectionUrl, mongooseConnectionOptions)
  const modelDir = opts.modelPath

  const files = await readdir(modelDir)
  const modelsFiles = files.filter(file => !fs.statSync(`${modelDir}/${file}`).isDirectory())

  return modelsFiles.reduce((models, modelFile) => {
    const modelName = modelFile.split('.js')[0]
    const Model = require(`${modelDir}/${modelFile}`)
    const instance = new Model()

    let attributes = {}, staticMethods = [], instanceMethods = []
    Object.getOwnPropertyNames(Model).forEach(fieldName => {
      if (jsClassProtoFields.includes(fieldName)) { return }
      const field = Model[fieldName]
      if (typeof field === 'function' && !mongooseTypesNames.includes(field.name)) {
        staticMethods.push(fieldName)
      } else {
        attributes[fieldName] = field
      }
    })

    Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).forEach(fieldName => {
      if (typeof instance[fieldName] === 'function' && fieldName !== 'constructor') {
        instanceMethods.push(fieldName)
      }
    })

    const schema = new mongoose.Schema(attributes, { timestamps: true })
    staticMethods.forEach(methodName => schema.static(methodName, Model[methodName]))
    instanceMethods.forEach(methodName => schema.methods[methodName] = instance[methodName])
    models[modelName] = mongoose.model(modelName, schema)
    return models
  }, {})
}
