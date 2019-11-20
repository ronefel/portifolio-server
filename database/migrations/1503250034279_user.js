/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', table => {
      table.increments()
      table.string('name', 100).notNullable()
      table
        .string('email', 254)
        .notNullable()
        .unique()
      table.string('avatar', 100)
      table.string('password', 60).notNullable()
      table.boolean('is_admin').defaultTo(false)
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
