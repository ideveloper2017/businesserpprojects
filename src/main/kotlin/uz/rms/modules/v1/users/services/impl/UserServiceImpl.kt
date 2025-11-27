//package uz.idev.app.v1.user.service.impl
//
//import jakarta.persistence.EntityNotFoundException
//import org.springframework.stereotype.Service
//import jakarta.transaction.Transactional
//import uz.idev.app.v1.user.dto.UserDto
//import uz.idev.app.v1.user.model.User
//import uz.idev.app.v1.user.repository.RoleRepository
//import uz.idev.app.v1.user.repository.UserRepository
//import uz.idev.app.v1.user.service.UserService
//
//@Service
//class UserServiceImpl(
//    private val userRepository: UserRepository,
//    private val roleRepository: RoleRepository
//) : UserService {
//
//    override fun getAllUsers(): List<UserDto> {
//        return userRepository.findAll().mapNotNull { UserDto.fromUser(it) }
//    }
//
//    override fun getUserById(id: Long): UserDto {
//        val user = userRepository.findById(id)
//            .orElseThrow { EntityNotFoundException("User not found with id: $id") }
//        return UserDto.fromUser(user) ?: throw IllegalStateException("Failed to convert user to DTO")
//    }
//
//    @Transactional
//    override fun createUser(userDto: UserDto): UserDto {
//        if (userRepository.existsByUsername(userDto.username)) {
//            throw IllegalArgumentException("Username ${userDto.username} already exists")
//        }
//        if (userRepository.existsByEmail(userDto.email)) {
//            throw IllegalArgumentException("Email ${userDto.email} already exists")
//        }
//
//        val user = User().apply {
//            username = userDto.username
//            phone = userDto.phone
//            email = userDto.email
//            firstName = userDto.firstName
//            lastName = userDto.lastName
//            active = userDto.active
//            password = "changeMe" // This should be encoded in a real application
//        }
//
//        if (userDto.roleIds.isNotEmpty()) {
//            val roles = roleRepository.findAllById(userDto.roleIds).toMutableSet()
//            user.roles = roles
//        }
//
//        val savedUser = userRepository.save(user)
//        return UserDto.fromUser(savedUser) ?: throw IllegalStateException("Failed to convert saved user to DTO")
//    }
//
//    @Transactional
//    override fun updateUser(id: Long, userDto: UserDto): UserDto {
//        val existingUser = userRepository.findById(id)
//            .orElseThrow { EntityNotFoundException("User not found with id: $id") }
//
//        // Check if username is being changed and if it's already taken
//        if (existingUser.username != userDto.username && userRepository.existsByUsername(userDto.username)) {
//            throw IllegalArgumentException("Username ${userDto.username} already exists")
//        }
//
//        // Check if email is being changed and if it's already taken
//        if (existingUser.email != userDto.email && userRepository.existsByEmail(userDto.email)) {
//            throw IllegalArgumentException("Email ${userDto.email} already exists")
//        }
//
//        // Update user properties
//        existingUser.username = userDto.username
//        existingUser.phone = userDto.phone
//        existingUser.email = userDto.email
//        existingUser.firstName = userDto.firstName
//        existingUser.lastName = userDto.lastName
//        existingUser.active = userDto.active
//
//        if (userDto.roleIds.isNotEmpty()) {
//            val roles = roleRepository.findAllById(userDto.roleIds).toMutableSet()
//            existingUser.roles = roles
//        }
//
//        val updatedUser = userRepository.save(existingUser)
//        return UserDto.fromUser(updatedUser) ?: throw IllegalStateException("Failed to convert updated user to DTO")
//    }
//
//
//
//    @Transactional
//    override fun deleteUser(id: Long) {
//        if (!userRepository.existsById(id)) {
//            throw EntityNotFoundException("User not found with id: $id")
//        }
//        userRepository.deleteById(id)
//    }
//
//    @Transactional
//    override fun assignRolesToUser(userId: Long, roleIds: List<Long>): UserDto {
//        val user = userRepository.findById(userId)
//            .orElseThrow { EntityNotFoundException("User not found with id: $userId") }
//
//        val roles = roleRepository.findAllById(roleIds).toMutableSet()
//        user.roles = roles
//
//        val updatedUser = userRepository.save(user)
//        return UserDto.fromUser(updatedUser) ?: throw IllegalStateException("Failed to convert user with assigned roles to DTO")
//    }
//
//    @Transactional
//    override fun removeRolesFromUser(
//        userId: Long,
//        roleIds: List<Long>
//    ): UserDto {
//        // Get user or throw exception if not found
//        val user = userRepository.findById(userId)
//            .orElseThrow { EntityNotFoundException("User not found with id: $userId") }
//
//        // Get roles to remove
//        val rolesToRemove = roleRepository.findAllById(roleIds).toSet()
//
//        // Update user's roles
//        user.roles = user.roles?.filter { role -> !rolesToRemove.contains(role) }
//            ?.toMutableSet()
//            ?: mutableSetOf()
//
//        // Save updated user
//        val updatedUser = userRepository.save(user)
//
//        // Convert to DTO
//        return UserDto.fromUser(updatedUser) ?: throw IllegalStateException("Failed to convert user to DTO")
//    }
//
//}