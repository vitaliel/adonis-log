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
          <Link className="page-link" href={meta.first_page_url ?? '#'} preserveScroll>
            First
          </Link>
        </li>

        <li className={`page-item ${!meta.prev_page_url ? 'disabled' : ''}`}>
          <Link className="page-link" href={meta.prev_page_url ?? '#'} preserveScroll>
            Previous
          </Link>
        </li>

        <li className="page-item disabled">
          <span className="page-link">
            {meta.current_page} / {meta.last_page}
          </span>
        </li>

        <li className={`page-item ${!meta.next_page_url ? 'disabled' : ''}`}>
          <Link className="page-link" href={meta.next_page_url ?? '#'} preserveScroll>
            Next
          </Link>
        </li>

        <li className={`page-item ${!meta.last_page_url ? 'disabled' : ''}`}>
          <Link className="page-link" href={meta.last_page_url ?? '#'} preserveScroll>
            Last
          </Link>
        </li>
      </ul>
    </nav>
  )
}
