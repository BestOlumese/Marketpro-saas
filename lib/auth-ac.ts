import { createAccessControl, role } from 'better-auth/plugins/access'

const statement = {
  organization: ['update', 'delete'],
  member:       ['create', 'update', 'delete'],
  invitation:   ['create', 'cancel'],
} as const

export const ac = createAccessControl(statement)

const ownerRole             = role({ organization: ['update', 'delete'], member: ['create', 'update', 'delete'], invitation: ['create', 'cancel'] })
const adminRole             = role({ organization: ['update'],           member: ['create', 'update', 'delete'], invitation: ['create', 'cancel'] })
const memberRole            = role({ organization: [],                   member: [],                             invitation: []                  })

export const orgRoles = {
  owner:             ownerRole,
  admin:             adminRole,
  member:            memberRole,
  accountant:        memberRole,
  inventory_manager: memberRole,
}
