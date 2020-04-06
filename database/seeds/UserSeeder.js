/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Env = use('Env')

class UserSeeder {
  async run() {
    await Factory.model('App/Models/User').create({
      name: Env.get('ADMIN_NAME'),
      email: Env.get('ADMIN_USER'),
      password: Env.get('ADMIN_PASSWORD'),
      is_admin: true
    })
  }
}

module.exports = UserSeeder
