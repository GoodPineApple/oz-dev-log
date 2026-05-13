import { fetchJson } from './client'
import type {
  AuthCredentials,
  AuthResponse,
  RegisterInput,
  User,
} from '../types'

export function register(input: RegisterInput) {
  return fetchJson<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: AuthCredentials) {
  return fetchJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function fetchMe() {
  return fetchJson<User>('/auth/me')
}
