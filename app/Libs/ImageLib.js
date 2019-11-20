const fs = use('fs')
const Helpers = use('Helpers')
const deleteFile = Helpers.promisify(fs.unlink)
const Jimp = use('jimp')

class ImageLib {
  static async readImage(file) {
    const image = await Jimp.read(file)
      .then(img => {
        return img
      })
      .catch(() => {
        return false
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

  static async storeImage(jimpImage, path, name) {
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

  static async destroyImage(path, name) {
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
