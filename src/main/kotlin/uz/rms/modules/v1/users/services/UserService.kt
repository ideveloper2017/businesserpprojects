package uz.rms.modules.v1.users.services

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.user.dto.UserDto
import uz.rms.modules.v1.users.domain.User
import uz.rms.modules.v1.users.repository.RoleRepository
import uz.rms.modules.v1.users.repository.UserRepository

@Service
@Transactional
class UserService(
    @Autowired
    private val userRepository: UserRepository,
    @Autowired
    private val roleRepository: RoleRepository
) {

    // Remove @PreAuthorize - authorization will be handled at controller level
    fun findAllUsers(): List<UserDto> {
        return userRepository.findAll().map { UserDto.fromUser(it) as UserDto }
    }

    fun findUserById(id: Long): User? {
        return userRepository.findById(id).orElse(null)
    }

    fun findUserByUsername(username: String): User? {
        return userRepository.findByLogin(username).orElse(null)
    }

    fun createUser(user: User): User {
        return userRepository.save(user)
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
    }

    fun deleteUser(id: Long) {
        userRepository.deleteById(id)
    }

    fun assignRoleToUser(userId: Long, roleName: String) {
        val user = userRepository.findById(userId).orElseThrow {
            RuntimeException("User not found")
        }
        val role = roleRepository.findByName(roleName).orElseThrow {
            RuntimeException("Role not found")
        }

        user.roles.add(role)
        userRepository.save(user)
    }

    fun removeRoleFromUser(userId: Long, roleName: String) {
        val user = userRepository.findById(userId).orElseThrow {
            RuntimeException("User not found")
        }
        val role = roleRepository.findByName(roleName).orElseThrow {
            RuntimeException("Role not found")
        }

        user.roles.remove(role)
        userRepository.save(user)
    }

    fun getUserReports(userId: Long): List<String> {
        // This would return reports for the user
        return listOf("Report 1", "Report 2", "Report 3")
    }

    fun getUserProfile(targetUser: User): Map<String, Any> {
        return mapOf(
            "username" to targetUser.login,
            "email" to targetUser.email,
            "firstName" to targetUser.firstName,
            "lastName" to targetUser.lastName,
            "roles" to targetUser.roles.map { it.name }.sorted()
        )
    }

    private fun getCurrentUser(): User? {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication != null && authentication.isAuthenticated) {
            return when (authentication.principal) {
                is User -> authentication.principal as User
                is User -> {
                    val username = authentication.name
                    userRepository.findByLogin(username).orElse(null)
                }
                else -> null
            }
        }
        return null
    }

    fun isManagerOfUser(userId: Long): Boolean {
        val currentUser = getCurrentUser()
        return currentUser?.roles?.any { it.name == "MANAGER" } == true
    }

    fun isCurrentUser(username: String): Boolean {
        val currentUser = getCurrentUser()
        return currentUser?.login == username
    }
}