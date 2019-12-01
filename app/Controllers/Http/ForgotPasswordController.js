const Env = use('Env')

const Mail = use('Mail')
const User = use('App/Models/User')
const Database = use('Database')
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const { format, subMinutes } = require('date-fns')

class ForgotPasswordController {
  async store({ request, response }) {
    const emailForgot = request.input('emailForgot')

    const user = await User.findBy('email', emailForgot)
    if (user) {
      const random = await promisify(randomBytes)(24)
      const token = random.toString('hex')

      if (await this.tooManyRequestsForgot(user)) {
        return response.status(429).json({
          message:
            'You have performed this action many times. Try again later.',
          name: 'error',
          status: 429
        })
      }

      await user.tokens().create({
        token,
        type: 'forgot_password'
      })

      const resetUrl = `${Env.get('FRONT_URL')}/reset?token=${token}`

      Mail.send(
        'emails.forgotpassword',
        {
          name: user.name,
          resetUrl,
          appName: Env.get('APP_NAME'),
          appUrl: Env.get('FRONT_URL')
        },
        message => {
          message
            .to(user.email, user.name)
            .from('no-reply@kryscardoso.com', 'no-reply')
            .subject(`[${Env.get('APP_NAME')}] Resetar a senha`)
        }
      )
    }
  }

  async tooManyRequestsForgot(user) {
    // buscar 5 pedidos de esqueci a senha dentro de 10 minutos

    const dateSub = format(subMinutes(new Date(), 15), 'yyyy-MM-dd HH:mm:ss')
    const dateNow = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

    const count = await Database.table('tokens')
      .whereBetween('created_at', [dateSub, dateNow])
      .andWhere({ user_id: user.id })
      .andWhere({ type: 'forgot_password' })
      .count('* as total')

    return count[0].total >= 3
  }
}

module.exports = ForgotPasswordController
