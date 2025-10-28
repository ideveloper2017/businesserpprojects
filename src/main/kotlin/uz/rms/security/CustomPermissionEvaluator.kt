package uz.rms.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import uz.rms.modules.v1.users.domain.User
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.UserRepository

import java.io.Serializable

@Component
class CustomPermissionEvaluator(
    @Autowired
    private val userRepository: UserRepository,
    @Autowired
    private val permissionRepository: PermissionRepository
) : PermissionEvaluator {

    override fun hasPermission(
        authentication: Authentication?,
        targetDomainObject: Any?,
        permission: Any
    ): Boolean {
        if (authentication == null) return false

        val user = getUserFromAuthentication(authentication) ?: return false
        val permissionString = permission.toString()

        // Check if user has the required permission
        return hasPermissionInternal(user, permissionString, targetDomainObject)
    }

    override fun hasPermission(
        authentication: Authentication?,
        targetId: Serializable?,
        targetType: String?,
        permission: Any
    ): Boolean {
        if (authentication == null) return false

        val user = getUserFromAuthentication(authentication) ?: return false
        val permissionString = permission.toString()

        // For entity-level permissions, we need the target object
        // This is a simplified implementation - in real scenarios,
        // you'd fetch the entity by ID and check permissions
        return hasPermissionInternal(user, permissionString, null)
    }

    private fun getUserFromAuthentication(authentication: Authentication): User? {
        val username = authentication.name
        return userRepository.findByLogin(username).orElse(null)
    }

    private fun hasPermissionInternal(user: User, permissionString: String, targetObject: Any?): Boolean {
        // Admin has all permissions
        if (user.roles.any { it.name == "ADMIN" }) {
            return true
        }

        // Check direct permissions
        if (user.permissions.any { it.authority == permissionString }) {
            return true
        }

        // Check role-based permissions
        user.roles.forEach { role ->
            if (role.permissions.any { it.authority == permissionString }) {
                return true
            }
        }

        // Entity-level permission checks
        if (targetObject != null) {
            return checkEntityLevelPermission(user, permissionString, targetObject)
        }

        return false
    }

    private fun checkEntityLevelPermission(user: User, permissionString: String, targetObject: Any): Boolean {
        // This is where you implement entity-level access control
        // For example, checking if the user owns the resource

        // Parse permission string (format: "resource:action")
        val parts = permissionString.split(":")
        if (parts.size != 2) return false

        val resource = parts[0]
        val action = parts[1]

        return when (resource) {
            "USER" -> checkUserPermission(user, action, targetObject)
            "PROJECT" -> checkProjectPermission(user, action, targetObject)
            "DOCUMENT" -> checkDocumentPermission(user, action, targetObject)
            else -> false
        }
    }

    private fun checkUserPermission(user: User, action: String, targetObject: Any): Boolean {
        return when (action) {
            "READ" -> true // Users can read other users
            "UPDATE" -> {
                // Users can only update themselves unless they have admin permissions
                if (targetObject is User) {
                    return targetObject.id == user.id || user.roles.any { it.name == "ADMIN" }
                }
                false
            }
            "DELETE" -> {
                // Only admins can delete users
                user.roles.any { it.name == "ADMIN" }
            }
            else -> false
        }
    }

    private fun checkProjectPermission(user: User, action: String, targetObject: Any): Boolean {
        // Implement project-level permissions
        // This would typically involve checking project ownership, team membership, etc.
        return when (action) {
            "READ" -> true // Users can read projects they have access to
            "UPDATE", "DELETE" -> {
                // Only project owners or admins can modify/delete
                user.roles.any { it.name == "ADMIN" }
            }
            else -> false
        }
    }

    private fun checkDocumentPermission(user: User, action: String, targetObject: Any): Boolean {
        // Implement document-level permissions
        return when (action) {
            "READ" -> true
            "UPDATE", "DELETE" -> {
                user.roles.any { it.name in listOf("ADMIN", "MANAGER") }
            }
            else -> false
        }
    }
}
