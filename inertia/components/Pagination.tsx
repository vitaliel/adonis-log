import { Link } from '@adonisjs/inertia/react'
import type { PaginationMeta } from '~/types'

interface PaginationProps {
  meta: PaginationMeta
}

export function Pagination({ meta }: PaginationProps) {
  if (meta.last_page <= 1) {
    return null
  }

  return (
    <nav aria-label="Posts pagination">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${!meta.first_page_url ? 'disabled' : ''}`}>
          {meta.first_page_url ? (
            <Link className="page-link" href={meta.first_page_url} preserveScroll>
              First
            </Link>
          ) : (
            <span className="page-link">First</span>
          )}
        </li>

        <li className={`page-item ${!meta.prev_page_url ? 'disabled' : ''}`}>
          {meta.prev_page_url ? (
            <Link className="page-link" href={meta.prev_page_url} preserveScroll>
              Previous
            </Link>
          ) : (
            <span className="page-link">Previous</span>
          )}
        </li>

        <li className="page-item disabled">
          <span className="page-link">
            {meta.current_page} / {meta.last_page}
          </span>
        </li>

        <li className={`page-item ${!meta.next_page_url ? 'disabled' : ''}`}>
          {meta.next_page_url ? (
            <Link className="page-link" href={meta.next_page_url} preserveScroll>
              Next
            </Link>
          ) : (
            <span className="page-link">Next</span>
          )}
        </li>

        <li className={`page-item ${!meta.last_page_url ? 'disabled' : ''}`}>
          {meta.last_page_url ? (
            <Link className="page-link" href={meta.last_page_url} preserveScroll>
              Last
            </Link>
          ) : (
            <span className="page-link">Last</span>
          )}
        </li>
      </ul>
    </nav>
  )
}
