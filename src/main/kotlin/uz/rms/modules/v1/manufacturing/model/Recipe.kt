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

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var items: MutableList<RecipeItem> = mutableListOf()
}
