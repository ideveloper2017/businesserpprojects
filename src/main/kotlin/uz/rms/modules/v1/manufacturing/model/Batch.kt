package uz.rms.modules.v1.manufacturing.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import uz.rms.common.BaseEntity
import java.time.LocalDate

@Entity
@Table(name = "batches")
class Batch : BaseEntity() {
    @Column(nullable = false)
    var productId: Long = 0

    @Column(nullable = false, length = 64, unique = false)
    lateinit var batchNumber: String

    var productionDate: LocalDate? = null
    var expiryDate: LocalDate? = null
}
