const fs = use('fs')
const Helpers = use('Helpers')
const readFile = Helpers.promisify(fs.readFile)
const deleteFile = Helpers.promisify(fs.unlink)
const Jimp = use('jimp')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const path = Helpers.appRoot(`${Env.get('IMAGES_PATH')}`)

class ImageLib {
  static async processImage(file) {
    const optimizeAndResize = async img => {
      await img.resize(1080, Jimp.AUTO)
      await img.quality(90)
      return img
    }

    const image = await Jimp.read(file)
      .then(img => {
        return optimizeAndResize(img)
      })
      .catch(() => {
        return false
      })
    return image
  }

  static async storeImage(jimpImage, name) {
    const image = await jimpImage
      .writeAsync(`${path}/${name}`)
      .then(img => {
        return img
      })
      .catch(() => {
        return false
      })
    if (image) {
      return name
    }
    return false
  }

  static async readImage(name) {
    return readFile(`${path}/${name}`)
      .then(image => {
        return image
      })
      .catch(() => {
        return false
      })
  }

  static getPath(name) {
    return `${path}/${name}`
  }

  static async destroyImage(name) {
    return deleteFile(`${path}/${name}`)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  }
}

module.exports = ImageLib
