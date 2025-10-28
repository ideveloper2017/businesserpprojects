package uz.rms.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.domain.User


class UserDetailsImpl(
   user: User) : UserDetails {
    // Store only necessary properties instead of the whole User object
    private val id: Long? = user.id
    private val username: String = user.username
    private val password: String = user.password
    private val active: Boolean = user.enabled
    private val authorities: MutableCollection<GrantedAuthority>

    // Store serialized copy of user for when it's needed
    private val userProperties: Map<String, Any?>

    init {
        // Extract authorities at initialization time
        authorities = user.roles.flatMap { role ->
            val permissions = role.permissions.map { SimpleGrantedAuthority(it.name) }
            listOf(SimpleGrantedAuthority("ROLE_${role.name}")) + permissions
        }.toMutableList()

        // Store essential user properties for recreation
        userProperties = mapOf(
            "id" to user.id,
            "username" to user.username,
            "phone" to user.phone,
            "email" to user.email,
            "firstName" to user.firstName,
            "lastName" to user.lastName,
            "active" to user.enabled,
            "roles" to user.roles,
            "tenant" to user.tenant
        )
    }
    override fun getAuthorities(): Collection<GrantedAuthority?>? {
        return authorities
    }

    override fun getPassword()= password

    override fun getUsername()= username
    override fun isCredentialsNonExpired(): Boolean = true

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    fun getId(): Long? = id

    @Suppress("UNCHECKED_CAST")
    fun getUser(): User {
        val user = User()
        user.id = userProperties["id"] as? Long
        user.login = userProperties["username"] as String
        user.phone = userProperties["phone"] as String
        user.email = userProperties["email"] as String
        user.firstName = (userProperties["firstName"] as? String).toString()
        user.lastName = (userProperties["lastName"] as? String).toString()
        user.enabled = userProperties["active"] as Boolean
        user.roles = userProperties["roles"] as MutableSet<Role>
        user.tenant=userProperties["tenant"] as Tenant?
        return user
    }
    companion object {
        fun build(user: User): UserDetailsImpl {
            val authorities = user.roles.flatMap { role ->
                listOf(SimpleGrantedAuthority("ROLE_${role.name}")) +
                        role.permissions.map { SimpleGrantedAuthority(it.name) }
            }

            return UserDetailsImpl(user)
        }
    }


}