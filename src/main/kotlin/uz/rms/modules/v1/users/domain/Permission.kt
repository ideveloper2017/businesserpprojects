package uz.rms.modules.v1.users.domain

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import uz.rms.common.BaseEntity



@Entity
@Table(name = "permissions")
class Permission(
    @Column(nullable = false, unique = true)
    var name: String,

    @Column(nullable = false)
    var description: String,

    @Column(nullable = false)
    var resource: String,

    @Column(nullable = false)
    var action: String,

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    var roles: MutableSet<Role> = mutableSetOf()

) : BaseEntity(), GrantedAuthority {

    override fun getAuthority(): String = name

    // Override equals to only use id (from BaseEntity)
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        other as Permission
        return id != null && id == other.id
    }

    // Override hashCode to only use id (from BaseEntity)
    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

    override fun toString(): String {
        return "Permission(id=$id, name='$name', resource='$resource', action='$action')"
    }
}
