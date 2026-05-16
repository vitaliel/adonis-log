import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/Login': ExtractProps<(typeof import('../../inertia/pages/auth/Login.tsx'))['default']>
    'auth/Register': ExtractProps<(typeof import('../../inertia/pages/auth/Register.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'posts/PostCreate': ExtractProps<(typeof import('../../inertia/pages/posts/PostCreate.tsx'))['default']>
    'posts/PostEdit': ExtractProps<(typeof import('../../inertia/pages/posts/PostEdit.tsx'))['default']>
    'posts/PostIndex': ExtractProps<(typeof import('../../inertia/pages/posts/PostIndex.tsx'))['default']>
    'posts/PostShow': ExtractProps<(typeof import('../../inertia/pages/posts/PostShow.tsx'))['default']>
    'users/UserProfile': ExtractProps<(typeof import('../../inertia/pages/users/UserProfile.tsx'))['default']>
  }
}
