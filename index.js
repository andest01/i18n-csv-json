const fs = require('fs')
const glob = require('glob-promise')
const _ = require('lodash')
const dsv = require('d3-dsv')
const dsvParser = dsv.dsvFormat('\t')

const getData = (fileName, type) => {
  return new Promise((resolve, reject) => {
    return fs.readFile(fileName, type, (err, data) => {
      return err ? reject(err) : resolve(data)
    })
  })
}

const saveData = (data, fileName) => {
  const content = JSON.stringify(data)

  return new Promise((resolve, reject) => {
    return fs.writeFile(fileName, content, (err) => {
      return err ? reject(err) : resolve()
    })
  })
}

const deleteIfExists = (pathOfFile) => {
  return new Promise((resolve, reject) => {
    fs.exists(pathOfFile, function(exists) {
      if(exists) {
        fs.unlinkSync(pathOfFile);
      }
      resolve();
    })
  })
}

  
const getFiles = async (pattern) => {
  let fileNames = await glob(`**/*${pattern}`)
  let filePromises = fileNames.map(name => {
    return getData(name, 'utf8')
  })

  let translationObjects = await Promise.all(filePromises)
  return translationObjects
}

const convertFileContentsToObject = (fileContents) => {
  const results = dsvParser.parse(fileContents)
  return results
}

const splitTranslationsIntoLocales = (translationArray, key = 'key') => {
  if (_.isEmpty(translationArray)) {
    throw new Error('cannot split null object into locales. Check to make sure you have translations.')
  }

  // for the sake of speed, assume the first object 
  // has all the keys we need.
  const firstObject = translationArray[0]
  const keys = _.keys(firstObject)

  let localeDictionary = {}
  const locales = keys.filter(k => k !== key)
    .reduce((dictionary, item) => {
      dictionary[item] = {}
      return dictionary
    }, {})
  const justTheLocaleKeys = _.keys(locales)

  // this part is yucky, but basically
  // make a dictionary of dictionaries.

  // the first-level dictionary is our locales.
  // e.g. en-us or fr-ca.
  // within those dictionaries, put your keys and your values.
  translationArray.reduce((dictionary, item) => {
    justTheLocaleKeys.forEach(l => {
      // e.g. 'en-us': { 'foo': 'bar' }
      const currentDictionary = dictionary[l]
      const itemKey = item[key]
      const actualTextValue = item[l]
      if (currentDictionary[itemKey] != null) {
        throw new Error(`found duplicate key for ${itemKey}. Aborting.`)
      }
      currentDictionary[itemKey] = actualTextValue
    })
    return dictionary
  }, locales)

  return locales
}



const saveDictionaryToJson = async (dictionary, destinationPath) => {
  let locales = _.forIn(dictionary, async (value, key) => {
    let filePath = `${destinationPath}/${key}.json`
    await deleteIfExists(filePath)
    try {
      await saveData(value, filePath)
      const stats = fs.statSync(filePath)
      const fileSizeInBytes = stats.size
      const fileSizeInKilobytes = Math.round(fileSizeInBytes / 1000.0, 1)
      console.log(`done saving '${filePath}' (${fileSizeInKilobytes} kB)`)
    } catch (error) {
      console.log(error)
    }
  })
}

const exportI18nDsvToJson = async (pattern, destinationPath, key = 'key') => {
  let dataArray = await getFiles(pattern)
    .map(convertFileContentsToObject)
  let data = [].concat.apply(dataArray)
}

module.exports = {
  getData,
  splitTranslationsIntoLocales,
  getFiles,
  convertFileContentsToObject,
  exportI18nDsvToJson,
  saveDictionaryToJson
}
