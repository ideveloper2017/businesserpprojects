package uz.rms.modules.v1.order.dto

import uz.rms.modules.v1.product.dto.ProductDto
import java.math.BigDecimal

/**
 * Data Transfer Object representing an `OrderItem` entity. This DTO is intended
 * to be returned to API consumers so that we do **not** expose the JPA entity
 * directly.
 */
data class OrderItemDto(
    val productId: Long?,
    val product: ProductDto?,
    val quantity: Int,
    val unitPrice: BigDecimal,
    val totalPrice: BigDecimal,
)
