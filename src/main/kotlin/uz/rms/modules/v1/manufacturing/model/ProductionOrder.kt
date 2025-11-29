package uz.rms.modules.v1.manufacturing.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity
import java.math.BigDecimal

@Entity
@Table(name = "production_orders")
class ProductionOrder : BaseEntity() {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: ProductionOrderStatus = ProductionOrderStatus.DRAFT

    @Column(nullable = false)
    var recipeId: Long = 0

    @Column(nullable = false)
    var workCenter: String = ""

    @Column(nullable = false, precision = 18, scale = 4)
    var plannedQuantity: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 18, scale = 4)
    var producedQuantity: BigDecimal = BigDecimal.ZERO
}

enum class ProductionOrderStatus {
    DRAFT, RELEASED, IN_PROGRESS, COMPLETED, CLOSED
}
