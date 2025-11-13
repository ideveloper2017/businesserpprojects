package uz.rms.modules.v1.users.mapper

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.user.dto.UserDto
import uz.rms.modules.v1.users.domain.User

import uz.rms.modules.v1.users.repository.RoleRepository

@Component
class UserMapper @Autowired constructor(
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder
) {
    
    fun toDto(user: User): UserDto {
        return UserDto(
            id = user.id,
            username = user.login,
            password = "", // Don't expose password hash
            phone = user.phone,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            active = user.enabled,
            roleIds = user.roles.mapNotNull { it.id }
        )
    }
    
    fun toEntity(dto: UserDto, tenant: Tenant? = null): User {
        val user = User().apply {
            id = dto.id ?: 0
            login = dto.username
            phone = dto.phone
            email = dto.email
            firstName = dto.firstName ?: ""
            lastName = dto.lastName ?: ""
            enabled = dto.active
            this.tenant = tenant
            
            // Encode password if provided
            if (dto.password.isNotBlank()) {
                passwords = passwordEncoder.encode(dto.password)
            }
            
            // Set default values for UserDetails
            accountNonExpired = true
            accountNonLocked = true
            credentialsNonExpired = true
        }
        
        // Set roles if role IDs are provided
        if (dto.roleIds.isNotEmpty()) {
            val roles = roleRepository.findAllById(dto.roleIds).toMutableSet()
            user.roles = roles
        }
        
        return user
    }
    
    fun updateUserFromDto(user: User, dto: UserDto): User {
        user.apply {
            // Update basic fields
            if (dto.username.isNotBlank()) login = dto.username
            if (dto.phone.isNotBlank()) phone = dto.phone
            if (dto.email.isNotBlank()) email = dto.email
            dto.firstName?.let { firstName = it }
            dto.lastName?.let { lastName = it }
            
            // Update password if provided
            if (dto.password.isNotBlank()) {
                passwords = passwordEncoder.encode(dto.password)
            }
            
            // Update roles if provided
            if (dto.roleIds.isNotEmpty()) {
                val roles = roleRepository.findAllById(dto.roleIds).toMutableSet()
                this.roles = roles
            }
            
            // Update enabled status if changed
            enabled = dto.active
        }
        
        return user
    }
    
    fun toDtoList(users: List<User>): List<UserDto> {
        return users.map { toDto(it) }
    }

 }

