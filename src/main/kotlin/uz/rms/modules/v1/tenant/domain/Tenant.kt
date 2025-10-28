package uz.rms.modules.v1.tenant.domain


import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import uz.rms.common.BaseEntity

@Entity
@Table(name = "tenants")
class Tenant(
    @Column(nullable = false, unique = true)
    var name: String,

    @Column(nullable = false, unique = true)
    var domain: String,

    @Column(nullable = false)
    var active: Boolean = true
) : BaseEntity()