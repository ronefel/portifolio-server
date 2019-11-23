/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

const Helpers = use('Helpers')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const IMAGES_PATH = Helpers.appRoot(`${Env.get('IMAGES_PATH')}`)

class Photo extends Model {
  // static get hidden() {
  //   return ['name']
  // }

  static get computed() {
    return ['image_url']
  }

  static get updatedAtColumn() {
    return null
  }

  getImageUrl({ name }) {
    return `${Env.get('IMAGES_URL')}/${name}`
  }

  async deletePhoto() {
    await ImageLib.destroyImage(IMAGES_PATH, this.name)
  }

  gallery() {
    return this.belongsTo('App/Models/Gallery')
  }
}

module.exports = Photo
