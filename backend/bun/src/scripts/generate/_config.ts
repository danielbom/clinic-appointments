import { Path } from '../../lib/path'

export const COMPONENT_GROUPS = ['core', 'domain', 'errors', 'body', 'schemas'] as const
export type ComponentGroup = (typeof COMPONENT_GROUPS)[number]

export const SCHEMA_BASE_URL = 'https://dev-clinic-appointments.com.br'

const ROOT = Path.from(import.meta.dirname)
  .parent()
  .parent()
  .parent()
export const SPEC_DIR = ROOT.append('src/specs/http')
// export const SPEC_BASE = SPEC_DIR.append("openapi.base.json") // TODO
export const SPEC_BASE = SPEC_DIR.append('openapi.base.json')
export const SPEC_SCHEMAS_DIR = SPEC_DIR.append('schemas')
export const SPEC_PATHS_DIR = SPEC_DIR.append('paths')

export const BUNDLE_PATH = ROOT.append('src/public/api/openapi.json')
export const PUBLIC_SCHEMAS_DIR = ROOT.append('src/public/schemas')

export const TYPES_PATH = ROOT.append('src/http/types.ts')
export const ROUTES_PATH = ROOT.append('src/http/routes.ts')
export const VALIDATIONS_PATH = ROOT.append('src/http/validations.ts')
