package uz.rms.modules.v1.order.dto

import uz.rms.modules.v1.customer.dto.CustomerDto
import uz.rms.modules.v1.order.model.OrderStatus
import uz.rms.modules.v1.order.model.PaymentStatus
import uz.rms.modules.v1.user.dto.UserDto
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDateTime

/**
 * DTO that represents an `Order` without exposing JPA entity internals.
 */
data class OrderDto(
    val id: Long?,
    val orderNumber: String,
    val user: UserDto?,
    val customer: CustomerDto?,
    val items: List<OrderItemDto>,
    val subtotal: BigDecimal,
    val taxAmount: BigDecimal,
    val discountAmount: BigDecimal,
    val totalAmount: BigDecimal,
    val orderDate: LocalDateTime,
    val status: OrderStatus,
    val paymentStatus: PaymentStatus,
    val customerNotes: String?,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)
