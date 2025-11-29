package uz.rms.modules.v1.manufacturing.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity
import java.math.BigDecimal

@Entity
@Table(name = "recipes")
class Recipe : BaseEntity() {
    @Column(nullable = false, length = 150)
    lateinit var name: String

    @Column(nullable = false)
    var productId: Long = 0

    @Column(nullable = false, precision = 18, scale = 4)
    var outputQuantity: BigDecimal = BigDecimal.ZERO

    @Column(name = "yield_factor", nullable = false, precision = 7, scale = 4)
    var yield: BigDecimal = BigDecimal.ONE

    @Column(nullable = false, precision = 18, scale = 4)
    var laborCost: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 18, scale = 4)
    var overheadCost: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 18, scale = 4)
    var completedQuantity: BigDecimal = BigDecimal.ZERO

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var items: MutableList<RecipeItem> = mutableListOf()
}
