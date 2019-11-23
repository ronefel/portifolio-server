/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Gallery extends Model {
  photos() {
    return this.hasMany('App/Models/Photo')
  }
}

module.exports = Gallery
