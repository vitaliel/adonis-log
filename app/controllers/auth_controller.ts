import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import { loginValidator } from '#validators/auth/login_validator'
import { errors as authErrors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/Register', {})
  }

  async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    await auth.use('web').login(user)
    return response.redirect('/posts')
  }

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/Login', {})
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect('/posts')
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        session.flash('errors', { email: 'Invalid email or password' })
        return response.redirect().toRoute('auth.login.show')
      }
      throw error
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/posts')
  }
}
