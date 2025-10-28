# RMS Projects - Role-Based Access Control (RBAC) System

A comprehensive Spring Boot application implementing Role-Based Access Control with JWT authentication, method-level security, and audit logging.

## Features

- **JWT Authentication**: Secure token-based authentication with custom claims
- **Role-Based Access Control**: Three-tier role system (ADMIN, MANAGER, USER)
- **Method-Level Security**: Fine-grained access control using `@PreAuthorize` annotations
- **Permission-Based Authorization**: Custom PermissionEvaluator for entity-level access checks
- **Dynamic Role Management**: Runtime role and permission management via admin APIs
- **Audit Logging**: Comprehensive logging of all access control decisions
- **Database-Backed UserDetailsService**: Dynamic user management with roles and permissions

## Architecture

### Core Components

1. **Authentication Layer**
   - JWT token generation and validation
   - Custom authentication entry point
   - Token-based request filtering

2. **Authorization Layer**
   - Role-based access control
   - Permission-based authorization
   - Method-level security with SpEL expressions

3. **Audit Layer**
   - Security event logging
   - Access control decision tracking
   - Failed attempt monitoring

## Security Configuration

### Roles and Permissions

#### Roles
- **ADMIN**: Full system access, user management, role/permission management
- **MANAGER**: Elevated access to projects and users, cannot delete users
- **USER**: Basic access to read operations and personal profile management

#### Permissions
The system supports granular permissions for different resources:
- **USER**: READ, CREATE, UPDATE, DELETE
- **ROLE**: READ, CREATE, UPDATE, DELETE, ASSIGN, REVOKE
- **PERMISSION**: READ, CREATE, UPDATE, DELETE
- **PROJECT**: READ, CREATE, UPDATE, DELETE
- **DOCUMENT**: READ, CREATE, UPDATE, DELETE
- **SYSTEM**: CONFIG
- **AUDIT**: READ

## API Endpoints

### Public Endpoints
```
GET /api/public/health - Health check
GET /api/public/info - Application information
GET /api/public/features - Feature list
```

### Authentication Endpoints
```
POST /api/auth/signin - User login
POST /api/auth/signup - User registration
POST /api/auth/signout - User logout
GET /api/auth/me - Current user information
```

### User Management (Role-based access)
```
GET /api/users - List all users (ADMIN only)
GET /api/users/{id} - Get user by ID (ADMIN, MANAGER)
GET /api/users/profile - Get current user profile (USER, MANAGER, ADMIN)
GET /api/users/username/{username} - Get user by username (USER, MANAGER, ADMIN)
POST /api/users - Create user (ADMIN only)
PUT /api/users/{id} - Update user (ADMIN only)
DELETE /api/users/{id} - Delete user (ADMIN only)
```

### Resource Management (HTTP Method restrictions)
```
GET /api/resources - List resources (USER, MANAGER, ADMIN)
GET /api/resources/{id} - Get resource by ID (USER, MANAGER, ADMIN)
POST /api/resources - Create resource (MANAGER, ADMIN)
PUT /api/resources/{id} - Update resource (MANAGER, ADMIN)
DELETE /api/resources/{id} - Delete resource (ADMIN only)
```

### Admin Management (ADMIN only)
```
GET /api/admin/roles - List all roles
GET /api/admin/roles/{id} - Get role by ID
GET /api/admin/roles/name/{name} - Get role by name
POST /api/admin/roles - Create new role
PUT /api/admin/roles/{id} - Update role
DELETE /api/admin/roles/{id} - Delete role

GET /api/admin/permissions - List all permissions
GET /api/admin/permissions/{id} - Get permission by ID
POST /api/admin/permissions - Create new permission
PUT /api/admin/permissions/{id} - Update permission
DELETE /api/admin/permissions/{id} - Delete permission

POST /api/admin/roles/{roleId}/permissions/{permissionId} - Assign permission to role
DELETE /api/admin/roles/{roleId}/permissions/{permissionId} - Remove permission from role
GET /api/admin/roles/{roleId}/permissions - Get role permissions
```

### Audit Management (ADMIN only)
```
GET /api/admin/audit/logs - Get recent audit logs
GET /api/admin/audit/logs/user/{userId} - Get audit logs for user
GET /api/admin/audit/logs/username/{username} - Get audit logs by username
GET /api/admin/audit/logs/action/{action} - Get audit logs by action
GET /api/admin/audit/logs/failed - Get failed access attempts
GET /api/admin/audit/logs/login-attempts - Get login attempt logs
GET /api/admin/audit/logs/summary - Get audit summary
```

## Method-Level Security Examples

### Role-Based Authorization
```kotlin
@PreAuthorize("hasRole('ADMIN')")
fun adminOnlyFunction()

@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
fun adminOrManagerFunction()

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
fun anyRoleFunction()
```

### Permission-Based Authorization
```kotlin
@PreAuthorize("hasPermission(#user, 'USER:UPDATE')")
fun updateUser(user: User)

@PreAuthorize("@customPermissionEvaluator.hasPermission(authentication, #targetUser, 'USER:READ')")
fun getUserProfile(targetUser: User)
```

### Complex SpEL Expressions
```kotlin
@PreAuthorize("""
    hasRole('ADMIN') or
    (hasRole('MANAGER') and @userService.isManagerOfUser(#userId)) or
    (@customPermissionEvaluator.hasPermission(authentication, #id, 'User', 'USER:READ'))
""")
fun complexAccessCheck(userId: Long)
```

## Usage Examples

### 1. User Login
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. Access Protected Resource
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Admin Role Management
```bash
curl -X POST http://localhost:8080/api/admin/roles \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "MODERATOR", "description": "Content moderator"}'
```

## Configuration

### JWT Configuration
```properties
rms.app.jwtSecret=your-secret-key-here
rms.app.jwtExpirationMs=86400000
```

### Database Configuration
```properties
spring.datasource.url=jdbc:h2:mem:rmsdb
spring.jpa.hibernate.ddl-auto=create-drop
```

## Security Best Practices Implemented

1. **Password Encryption**: BCrypt password hashing
2. **JWT Security**: Secure token generation with expiration
3. **CORS Protection**: Configurable cross-origin policies
4. **Audit Trail**: Complete logging of security events
5. **Principle of Least Privilege**: Granular permission system
6. **Defense in Depth**: Multiple layers of security controls

## Development Setup

1. **Prerequisites**
   - Java 17+
   - Gradle/Kotlin support
   - H2 Database (embedded)

2. **Build and Run**
   ```bash
   ./gradlew bootRun
   ```

3. **Access Points**
   - Application: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console
   - Health Check: http://localhost:8080/api/public/health

## Testing

The system includes comprehensive security testing capabilities:
- Unit tests for security components
- Integration tests for API endpoints
- Security audit logging verification
- Role-based access testing

## Production Considerations

1. **Security Headers**: Add security headers in production
2. **HTTPS**: Use HTTPS in production environments
3. **JWT Secret**: Use environment variables for JWT secrets
4. **Database**: Use production-grade database (PostgreSQL, MySQL)
5. **Monitoring**: Implement comprehensive logging and monitoring
6. **Rate Limiting**: Add rate limiting for API endpoints

## Contributing

1. Follow security best practices
2. Add comprehensive tests
3. Update documentation
4. Follow existing code patterns

## License

This project is licensed under the MIT License.
