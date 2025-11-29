package uz.rms.modules.v1.manufacturing.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(name = "production_outputs")
class ProductionOutput : BaseEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id", nullable = false)
    lateinit var productionOrder: ProductionOrder

    @Column(nullable = false)
    var productId: Long = 0

    @Column(nullable = false, precision = 18, scale = 4)
    var quantity: BigDecimal = BigDecimal.ZERO

    @Column(length = 64)
    var batchNumber: String? = null

    var expiryDate: LocalDate? = null
}
