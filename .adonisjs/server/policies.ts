export const policies = {
  CommentPolicy: () => import('#policies/comment_policy'),
  PostPolicy: () => import('#policies/post_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}

