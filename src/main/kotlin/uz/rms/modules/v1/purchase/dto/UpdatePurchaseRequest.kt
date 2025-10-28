package uz.rms.modules.v1.purchase.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.PositiveOrZero
import java.math.BigDecimal
import java.time.LocalDateTime

data class UpdatePurchaseRequest(
    @field:Schema(description = "New invoice number (if changing)")
    val invoiceNumber: String? = null,

    @field:Schema(description = "New supplier ID (if changing)")
    val supplierId: Long? = null,

    @field:Schema(description = "New warehouse ID (if changing)")
    val warehouseId: Long? = null,

    @field:Schema(description = "New purchase date (if changing)")
    val purchaseDate: LocalDateTime? = null,

    @field:Schema(description = "Updated notes")
    val notes: String? = null,

    @field:Schema(description = "Updated subtotal amount")
    @field:PositiveOrZero(message = "Subtotal must be zero or positive")
    val subTotal: BigDecimal? = null,

    @field:Schema(description = "Updated tax amount")
    @field:PositiveOrZero(message = "Tax amount must be zero or positive")
    val taxAmount: BigDecimal? = null,

    @field:Schema(description = "Updated discount amount")
    @field:PositiveOrZero(message = "Discount amount must be zero or positive")
    val discountAmount: BigDecimal? = null,

    @field:Schema(description = "Updated total amount")
    @field:PositiveOrZero(message = "Total amount must be zero or positive")
    val totalAmount: BigDecimal? = null,

    @field:Schema(description = "Updated paid amount")
    @field:PositiveOrZero(message = "Paid amount must be zero or positive")
    val paidAmount: BigDecimal? = null,

    @field:Schema(description = "Updated payment due date")
    val paymentDueDate: LocalDateTime? = null,

    @field:Schema(description = "Updated purchase status")
    val status: String? = null
)
