import {GITLAB_SET_SNIPPET_ID, GITLAB_SET_URL} from './Actions'

export function gitLabSetUrl(url) {
  return {type: GITLAB_SET_URL, url}
}

export function gitLabSetSnippetId(snippetId) {
  return {type: GITLAB_SET_SNIPPET_ID, snippetId}
}