package uz.rms.modules.v1.users.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.tenant.domain.Tenant


@Entity
@Table(name = "users")
class User : BaseEntity(), UserDetails {

    @Column(nullable = false, unique = true)
    var login: String=""

    @Column(unique = true, nullable = false)
    var phone: String=""

    @Column(nullable = false, unique = true)
    var email: String=""

    @JsonIgnore
    @Column(nullable = false)
    var passwords: String=""

    @Column(nullable = false)
    var firstName: String=""

    @Column(nullable = false)
    var lastName: String=""

    @Column(nullable = false)
    var enabled: Boolean = true

    @Column(nullable = false)
    var accountNonExpired: Boolean = true

    @Column(nullable = false)
    var accountNonLocked: Boolean = true

    @Column(nullable = false)
    var credentialsNonExpired: Boolean = true

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    var tenant: Tenant? = null

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    var roles: MutableSet<Role> = mutableSetOf()

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_permissions",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "permission_id")]
    )
    var permissions: MutableSet<Permission> = mutableSetOf()

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        val authorities = mutableSetOf<GrantedAuthority>()

        // Add role authorities
        authorities.addAll(roles.map { SimpleGrantedAuthority("ROLE_${it.name}") })

        // Add permission authorities
        authorities.addAll(permissions.map { SimpleGrantedAuthority(it.authority) })

        return authorities
    }

    override fun getPassword(): String = passwords

    override fun getUsername(): String = login

    override fun isAccountNonExpired(): Boolean = accountNonExpired

    override fun isAccountNonLocked(): Boolean = accountNonLocked

    override fun isCredentialsNonExpired(): Boolean = credentialsNonExpired

    override fun isEnabled(): Boolean = enabled

    fun getFullName(): String = "$firstName $lastName"

    override fun toString(): String {
        return "User(login='$login', email='$email', firstName='$firstName', lastName='$lastName')"
    }
}
