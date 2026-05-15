import { Link } from '@adonisjs/inertia/react'
import type { TagSummary } from '~/types'

interface TagBadgeProps {
  tag: TagSummary
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Link href={`/tags/${tag.slug}`} className="badge bg-secondary text-decoration-none me-1">
      {tag.name}
    </Link>
  )
}
