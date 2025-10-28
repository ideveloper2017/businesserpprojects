package uz.rms.modules.v1.order.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * Request DTO for creating a new order
 */
data class CreateOrderRequest(
    @field:NotNull(message = "Customer ID is required")
    val customerId: Long,
    
    val status: String = "pending",
    
    val notes: String? = null,
    
    @field:Valid
    @field:NotNull(message = "Order items are required")
    val items: List<OrderItemRequest>
)

/**
 * Request DTO for an order item
 */
data class OrderItemRequest(
    @field:NotNull(message = "Product ID is required")
    val productId: Long,
    
    @field:Min(value = 1, message = "Quantity must be at least 1")
    val quantity: Int,
    
    @field:Min(value = 0, message = "Unit price must be a positive number")
    val unitPrice: BigDecimal
)
