
package uz.rms.modules.v1.customer.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity

@Entity
@Table(name = "customers")
class Customer : BaseEntity() {

    @Column(nullable = false)
    var first_name: String? = null

    @Column(nullable = false)
    var last_name: String? = null

    @Column(nullable = false)
    var phone: String? = null

    @Column(nullable = false)
    var address: String? = null

    // Helper function to get full name
    fun getFullName(): String {
        return listOfNotNull(first_name, last_name).joinToString(" ")
    }
}
