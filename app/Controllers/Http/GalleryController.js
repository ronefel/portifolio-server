const Gallery = use('App/Models/Gallery')

class GalleryController {
  async index() {
    const galleries = await Gallery.all()
    return galleries
  }

  async store({ request }) {
    const data = request.only(['name'])
    const gallery = await Gallery.create(data)
    return gallery
  }

  async show({ params }) {
    const gallery = await Gallery.findOrFail(params.id)
    return gallery
  }

  async update({ params, request }) {
    const data = request.only(['name'])
    const gallery = await Gallery.findOrFail(params.id)
    gallery.merge(data)
    await gallery.save()
    return gallery
  }

  async destroy({ params }) {
    const gallery = await Gallery.findOrFail(params.id)
    // const photos = await gallery.photos().fetch()
    // photos.rows.forEach(async photo => {
    //   await photo.deletePhoto()
    //   await photo.delete()
    // })
    await gallery.delete()
  }
}

module.exports = GalleryController
