/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {typeof import('@adonisjs/')} */
const Helpers = use('Helpers')

const TMP_USER = Helpers.tmpPath('user')

class User extends Model {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  static get computed() {
    return ['avatar_url']
  }

  getAvatar() {
    if (this.avatar && ImageLib.existsImage(`${TMP_USER}/${this.avatar}`)) {
      return this.avatar
    }
    return null
  }

  getAvatarUrl({ avatar }) {
    if (avatar) {
      return `${Env.get('APP_URL')}/avatar/${avatar}`
    }
    return null
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = User
