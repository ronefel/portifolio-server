/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Photo = use('App/Models/Photo')

class PhotoController {
  async index({ auth, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }
    const photos = await Photo.query()
      .with('gallery')
      .fetch()
    return photos
  }

  async store({ auth, request, response }) {
    let image = null
    let imageProcessed = null

    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }

    const data = request.only(['gallery_id'])

    // gera um nome para a imagem
    data.name = `${new Date().getTime()}.jpg`
    // Salva os dados no banco
    const photo = await Photo.create(data)

    // pega a imagem da request
    image = request.file('image', {
      types: ['image'],
      size: '10mb'
    })

    if (image) {
      // lê a imagem
      try {
        image = await ImageLib.readImage(image.tmpPath)
      } catch (err) {
        return response.status(400).json({
          message: `Error to read image: ${err}`,
          name: 'error',
          status: 400
        })
      }

      try {
        // redimenciona e otimiza a imagem
        imageProcessed = await ImageLib.processImage(image)

        // salva a imagem no servidor
        await ImageLib.storeImage(imageProcessed, data.name)
      } catch (err) {
        // remove os dados do banco
        await photo.delete()
        return response.status(500).json({
          message: `Error to store image on server: ${err}`,
          name: 'error',
          status: 500
        })
      }
    }
    return photo
  }

  async show({ params, response }) {
    return response.download(ImageLib.getImagePath(params.name))
  }

  async destroy({ auth, params, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }
    const photo = await Photo.findOrFail(params.id)
    await photo.deletePhoto()
    await photo.delete()
  }
}

module.exports = PhotoController
