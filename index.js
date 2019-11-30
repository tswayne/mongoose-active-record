const fs = require('fs')
const readdir = require('util').promisify(fs.readdir)
const mongoose = require('mongoose')

const jsClassProtoFields = ['length', 'prototype']
const mongooseTypesNames = ['String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed', 'Object', 'ObjectId', 'Array', 'Decimal128','Map']

const isClassName = (fieldName, modelValue) => {
  return fieldName === 'name' && typeof modelValue === 'string'
}

module.exports = async (opts) => {
  const connectionOptions = opts.connectionOptions || {}
  await mongoose.connect(opts.connectionUrl, connectionOptions)
  const modelDir = opts.modelPath

  const files = await readdir(modelDir)
  const modelsFiles = files.filter(file => !fs.statSync(`${modelDir}/${file}`).isDirectory())

  return modelsFiles.reduce((models, modelFile) => {
    const modelName = modelFile.split('.js')[0].replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); })
    const Model = require(`${modelDir}/${modelFile}`)
    const instance = new Model()

    let attributes = {}, staticMethods = [], instanceMethods = []
    Object.getOwnPropertyNames(Model).forEach(fieldName => {
      if (jsClassProtoFields.includes(fieldName) || isClassName(fieldName, Model[fieldName])) { return }
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

    const schema = new mongoose.Schema(attributes, opts.schemaOptions)
    staticMethods.forEach(methodName => schema.static(methodName, Model[methodName]))
    instanceMethods.forEach(methodName => schema.methods[methodName] = instance[methodName])
    models[modelName] = mongoose.model(modelName, schema)
    return models
  }, {})
}
