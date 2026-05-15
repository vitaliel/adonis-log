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
