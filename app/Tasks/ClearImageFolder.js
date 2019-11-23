const Task = use('Task')
const { format } = use('date-fns')

const Logger = use('Logger')
const log = Logger.transport('file')

/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

const Photo = use('App/Models/Photo')

class ClearImageFolder extends Task {
  static get schedule() {
    return '0 0 1 * * *'
  }

  async handle() {
    log.info(
      `${format(
        new Date(),
        'dd/MM/yyyy HH:mm:ss zzzz'
      )} ClearImageFolderTask initialized...`
    )

    // get photos without gallery
    const photosWithoutGallery = await Photo.query()
      .doesntHave('gallery')
      .fetch()

    // delete photo without gallery
    photosWithoutGallery.rows.forEach(async photo => {
      await photo.deletePhoto() // delete image in server folder
      await photo.delete()
    })

    log.info(
      `${photosWithoutGallery.size()} photos without related gallery removed...`
    )

    // get all images in server folder
    const imagesInFolder = ImageLib.listImagesPath()

    // get all register of images of server folder
    const imagesInDB = await Photo.query()
      .whereIn('name', imagesInFolder)
      .fetch()

    // remove from the array all images registered in the database
    imagesInDB.rows.forEach(image => {
      imagesInFolder.splice(imagesInFolder.indexOf(image.name), 1)
    })

    // destroy all images are not registered in the database
    imagesInFolder.forEach(image => {
      ImageLib.destroyImage(image)
    })

    log.info(`${imagesInFolder.lenght()} unregistered photos removed...`)

    log.info(
      `${format(
        new Date(),
        'dd/MM/yyyy HH:mm:ss zzzz'
      )} ClearImageFolderTask finalized...`
    )
  }
}

module.exports = ClearImageFolder
