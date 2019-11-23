const { pathExistsSync, unlink, readdirSync } = use('fs-extra')
const Jimp = use('jimp')
const Env = use('Env')
const Helpers = use('Helpers')

const IMAGES_PATH = Helpers.appRoot(`${Env.get('IMAGES_PATH')}`)

class ImageLib {
  static async readImage(file) {
    const image = await Jimp.read(file)
      .then(img => {
        return img
      })
      .catch(err => {
        throw err
      })
    return image
  }

  static async processImage(img) {
    const { width, height } = img.bitmap
    const mode = Jimp.RESIZE_HERMITE
    if (width > 1080) {
      await img.resize(1080, Jimp.AUTO, mode)
    }
    if (height > 720) {
      await img.resize(Jimp.AUTO, 720, mode)
    }
    await img.quality(90)
    return img
  }

  static async storeImage(jimpImage, name, path = null) {
    const serverPath = path || IMAGES_PATH
    await jimpImage
      .writeAsync(`${serverPath}/${name}`)
      .then(img => {
        return img
      })
      .catch(err => {
        throw err
      })
  }

  static async destroyImage(name, path = null) {
    const serverPath = path || IMAGES_PATH
    if (this.existsImage(`${serverPath}/${name}`)) {
      return unlink(`${serverPath}/${name}`)
        .then(() => {
          return true
        })
        .catch(err => {
          throw err
        })
    }
  }

  static existsImage(path) {
    if (pathExistsSync(path)) {
      return true
    }
    return false
  }

  static getImagePath(name, path = null) {
    const serverPath = path || IMAGES_PATH
    return `${serverPath}/${name}`
  }

  static listImagesPath() {
    return readdirSync(IMAGES_PATH)
  }
}

module.exports = ImageLib
