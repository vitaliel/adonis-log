import { useForm } from '@inertiajs/react'
import { type PageProps } from '~/types'

export default function Login({ errors }: PageProps) {
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    post('/login')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <h1 className="mb-4">Log In</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={processing}>
            {processing ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  )
}
