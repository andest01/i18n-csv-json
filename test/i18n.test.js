var assert = require('assert')
const _ = require('lodash')

const {
  getData,
  getFiles,
  splitTranslationsIntoLocales,
  convertFileContentsToObject,
  exportI18nDsvToJson,
  saveDictionaryToJson } = require('../index')

const keyName = 'key'
const englishKey = 'en-us'
const frenchKey = 'fr-ca'

const firstItem = {
        [keyName]: 'ui.asdf',
        [englishKey]: 'US hello',
        [frenchKey]: 'FRENCH yep'
      }

const secondItem = {
        [keyName]: 'ui.ffff',
        [englishKey]: 'US asdfasdf',
        [frenchKey]: 'FRENCH dfsfsdfsfs'
      }

describe('I18n to JSON', function() {
  describe('getData', () => {
    it('should get data from pattern', async () => {
      const pattern = '.i18n.psv'
      const files = await getFiles(pattern)
      assert.ok(files.length > 0);
    })
  })

  describe('convertFileContentsToObject', () => {
    it('should turn string to object', async () => {
      const pattern = '.i18n.psv'
      const files = await getFiles(pattern)
      const results = convertFileContentsToObject(files[0])
      assert.ok(results[0].key != null);
    })
  })

  describe('splitTranslationsIntoLocales', () => {
    it('should split two languages into one object with two locale keys', async () => {
      const obj = [firstItem, secondItem]
      const localeObject = splitTranslationsIntoLocales(obj, keyName)
      const hasEnglish = localeObject[englishKey] !== null
      const hasFrench = localeObject[frenchKey] !== null

      assert.ok(hasEnglish && hasFrench)
    })

    it('should have a value for a key', async () => {
      
      const obj = [firstItem, secondItem]
      const localeObject = splitTranslationsIntoLocales(obj, keyName)
      const hasValue = localeObject[englishKey]['ui.asdf'][keyName] !== null

      assert.ok(hasValue);
    })
  })

  describe('saveDictionaryToJson', () => {
    it('should save a buncha stuff', async () => {
      const obj = [firstItem, secondItem]
      const localeObject = splitTranslationsIntoLocales(obj, keyName)
      await saveDictionaryToJson(localeObject, 'test/i18n')
    })
  })
})