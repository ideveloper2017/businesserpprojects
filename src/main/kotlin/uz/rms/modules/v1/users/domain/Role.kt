package uz.rms.modules.v1.users.domain

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.tenant.domain.Tenant


@Entity
@Table(name = "roles", 
    uniqueConstraints = [UniqueConstraint(columnNames = ["name", "tenant_id"])]
)
class Role(
    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var description: String,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_permissions",
        joinColumns = [JoinColumn(name = "role_id")],
        inverseJoinColumns = [JoinColumn(name = "permission_id")]
    )
    var permissions: MutableSet<Permission> = mutableSetOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    val tenant: Tenant

) : BaseEntity(), GrantedAuthority {

    override fun getAuthority(): String = "ROLE_$name"

    // Override equals to only use id (from BaseEntity)
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        other as Role
        return id != null && id == other.id
    }

    // Override hashCode to only use id (from BaseEntity)
    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

    override fun toString(): String {
        return "Role(id=$id, name='$name', description='$description')"
    }
}
