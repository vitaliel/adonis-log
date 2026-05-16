import { type Data } from '@generated/data'
import { type PropsWithChildren } from 'react'
import { type JSONDataTypes } from '@adonisjs/core/types/transformers'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>

export interface PageProps {
  auth: {
    user: {
      id: number
      username: string
      email: string
      bio: string | null
      createdAt: string
    } | null
  }
  flash: { success?: string; error?: string }
  errors: Record<string, string>
}

export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  first_page: number
  first_page_url: string
  last_page_url: string
  next_page_url: string | null
  prev_page_url: string | null
}

export interface TagSummary {
  name: string
  slug: string
}

export interface PostSummary {
  id: number
  title: string
  author_username: string
  created_at: string
  tags: TagSummary[]
  like_count: number
}

export interface PostDetail extends PostSummary {
  body: string
}

export interface SocialLink {
  id: number
  type: string
  url: string
}

export interface UserProfile {
  id: number
  username: string
  bio: string | null
  socialLinks: SocialLink[]
}
