package uz.rms.modules.v1.users.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import uz.rms.common.MessageResponse
import uz.rms.modules.v1.user.dto.UserDto
import uz.rms.modules.v1.users.domain.User
import uz.rms.modules.v1.users.services.UserService

@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management", description = "User management and profile APIs")
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    @Autowired
    private val userService: UserService
) {

    @Operation(summary = "Get all users", description = "Retrieve a list of all users (Admin only)")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        ApiResponse(responseCode = "403", description = "Access denied")
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllUsers(): ResponseEntity<List<UserDto>> {
        return ResponseEntity.ok(userService.findAllUsers())
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "User found"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "403", description = "Access denied")
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun getUserById(@Parameter(description = "User ID") @PathVariable id: Long): ResponseEntity<User> {
        val user = userService.findUserById(id)
        return (if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.notFound().build()
        }) as ResponseEntity<User>
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('MANAGER') or hasRole('ADMIN')")
    fun getCurrentUserProfile(authentication: Authentication): ResponseEntity<User> {
        val currentUser = authentication.principal as User
        return ResponseEntity.ok(currentUser)
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('USER') or hasRole('MANAGER') or hasRole('ADMIN')")
    fun getUserByUsername(@PathVariable username: String): ResponseEntity<User> {
        val user = userService.findUserByUsername(username)
        return (if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.notFound().build()
        }) as ResponseEntity<User>
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun createUser(@RequestBody user: User): ResponseEntity<User> {
        return ResponseEntity.ok(userService.createUser(user))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @customPermissionEvaluator.hasPermission(authentication, #user, 'USER:UPDATE')")
    fun updateUser(@PathVariable id: Long, @RequestBody user: User): ResponseEntity<User> {
        user.id = id
        return ResponseEntity.ok(userService.updateUser(user))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Void> {
        userService.deleteUser(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    fun assignRole(@PathVariable userId: Long, @PathVariable roleName: String): ResponseEntity<String> {
        userService.assignRoleToUser(userId, roleName)
        return ResponseEntity.ok("Role $roleName assigned to user $userId")
    }

    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    fun removeRole(@PathVariable userId: Long, @PathVariable roleName: String): ResponseEntity<String> {
        userService.removeRoleFromUser(userId, roleName)
        return ResponseEntity.ok("Role $roleName removed from user $userId")
    }

    @GetMapping("/{userId}/reports")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun getUserReports(@PathVariable userId: Long): ResponseEntity<List<String>> {
        return ResponseEntity.ok(userService.getUserReports(userId))
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun getUserProfile(@RequestBody targetUser: User): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(userService.getUserProfile(targetUser))
    }

    // Example of using SpEL with complex expressions
    @GetMapping("/advanced/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('USER')")
    fun getUserAdvanced(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return ResponseEntity.ok(MessageResponse("Advanced access granted for user $id"))
    }


    // Example of checking ownership
    @PutMapping("/profile/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    fun updateProfile(@RequestBody user: User): ResponseEntity<String> {
        return ResponseEntity.ok("Profile updated for ${user.login}")
    }
}