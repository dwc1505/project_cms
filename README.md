## auth/dto
    - payload-auth.dto.ts: defines JWT payload -> helps RolesGuard and RolesPermissionsGuard access user info from token to check roles/permissions

##  auth/passport: guard & strategy

    - jwt-auth.guard.ts: checks token JWT, @Public() bypass, handles token errors   
    - jwt.strategy.ts: extracts token from bearer, decodes it, returns user
    - local.strategy.ts: validates email/password, checks user status
    - roles.guard.ts:  checks role access
    - roles-permissions.guard.ts: checks detailed resource, permissions

## common/enums: defines shared enums (role, resource, permission, status)

## derector: set metadata

    - customize.ts: defines Public() -> bypass auth
    - roles.ts: defines Roles() -> assign roles to routes  
    - permissions: defines @Permissions()-> assign detailed permissions to routes, checked by guard

## helper
    - util.ts: hash password & compare for login

## user/dto
    - create-user.dto.ts: validate data when cre user
    - update-user.dto.ts: validate data when upd user