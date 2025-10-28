
package uz.rms.modules.v1.supplier.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity


@Entity
@Table(name = "supplier")
class Supplier : BaseEntity() {

    @Column(nullable = false)
    lateinit var first_name: String

    @Column(nullable = false)
    lateinit var last_name: String

    @Column(nullable = false)
    lateinit var email: String

    @Column(nullable = false)
    lateinit var phone: String

    @Column(nullable = false)
    lateinit var address: String

    @Column(nullable = false)
    lateinit var opening_balance: Number

    @Column(nullable = false)
    lateinit var opening_balance_type: Number



}
