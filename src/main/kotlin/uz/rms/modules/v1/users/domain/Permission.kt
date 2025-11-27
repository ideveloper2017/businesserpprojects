package uz.rms.modules.v1.users.domain

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import uz.rms.common.BaseEntity



@Entity
@Table(name = "permissions")
class Permission()
     : BaseEntity(), GrantedAuthority {

    @Column(nullable = false, unique = true)
    lateinit var name: String

    @Column(nullable = false)
    lateinit var description: String

    @Column(nullable = false)
    lateinit var resource: String

    @Column(nullable = false)
    lateinit var action: String

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    var roles: MutableSet<Role> = mutableSetOf()

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
