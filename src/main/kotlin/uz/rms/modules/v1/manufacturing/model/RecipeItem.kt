package uz.rms.modules.v1.manufacturing.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity
import java.math.BigDecimal

@Entity
@Table(name = "recipe_items")
class RecipeItem : BaseEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    lateinit var recipe: Recipe

    @Column(nullable = false)
    var productId: Long = 0

    @Column(nullable = false, precision = 18, scale = 4)
    var quantity: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, length = 16)
    var uom: String = "kg" // unit of measure

    @Column(nullable = false, precision = 5, scale = 2)
    var lossPercent: BigDecimal = BigDecimal.ZERO
}
