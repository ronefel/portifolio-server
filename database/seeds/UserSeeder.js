/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class UserSeeder {
  async run() {
    await Factory.model('App/Models/User').create({
      name: 'Rone Santos',
      email: 'ronefel@hotmail.com',
      password: 'fel0110$',
      is_admin: true
    })
  }
}

module.exports = UserSeeder
