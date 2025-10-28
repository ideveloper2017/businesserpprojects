package uz.rms.modules.v1.order.model

import jakarta.persistence.*
import java.math.BigDecimal
import io.swagger.v3.oas.annotations.media.Schema
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.product.model.Product

@Entity
@Table(name = "order_items")
@Schema(description = "Represents an item within an order")
class OrderItem : BaseEntity() {
    @Schema(description = "The order this item belongs to")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    lateinit var order: Order

    @Schema(description = "ID of the product", example = "42")
    @Column(name = "product_id", nullable = false)
    var productId: Long?= null

    // Bi-directional reference to Product (read-only for convenience)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    var product: Product? = null

    @Schema(description = "Quantity of the product ordered", example = "2")
    @Column(nullable = false)
    var quantity: Int = 0

    @Schema(description = "Price per unit", example = "99.99")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    var unitPrice: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    var discountAmount: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    var taxAmount: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    var totalPrice: BigDecimal = BigDecimal.ZERO
        set
    
    fun calculateTotal() {
        totalPrice = (unitPrice.multiply(BigDecimal(quantity))) - discountAmount + taxAmount
    }
}
