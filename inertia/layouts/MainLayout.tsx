import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { type ReactNode, useEffect } from 'react'
import { type PageProps } from '~/types'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { auth, flash } = usePage<PageProps>().props

  useEffect(() => {
    toast.dismiss()
  }, [usePage().url])

  useEffect(() => {
    if (flash?.error) toast.error(flash.error)
    if (flash?.success) toast.success(flash.success)
  })

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            AdonisLog
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/posts">
                  Posts
                </a>
              </li>
              {auth?.user ? (
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    href="/logout"
                    method="post"
                    as="button"
                    style={{ background: 'none', border: 'none' }}
                  >
                    Logout
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/login">
                      Login
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/register">
                      Register
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4">{children}</main>

      <footer className="bg-dark text-light py-3 mt-auto">
        <div className="container text-center">
          <small>&copy; {new Date().getFullYear()} AdonisLog</small>
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </>
  )
}
