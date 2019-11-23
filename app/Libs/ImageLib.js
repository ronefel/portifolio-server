const { pathExists, unlink } = use('fs-extra')
const Jimp = use('jimp')

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

  static async storeImage(jimpImage, path, name) {
    await jimpImage
      .writeAsync(`${path}/${name}`)
      .then(img => {
        return img
      })
      .catch(err => {
        throw err
      })
  }

  static async destroyImage(path, name) {
    if (await pathExists(`${path}/${name}`)) {
      return unlink(`${path}/${name}`)
        .then(() => {
          return true
        })
        .catch(err => {
          throw err
        })
    }
  }
}

module.exports = ImageLib
