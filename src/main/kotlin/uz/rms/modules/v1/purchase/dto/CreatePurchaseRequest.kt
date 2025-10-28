package uz.rms.modules.v1.purchase.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PositiveOrZero
import java.math.BigDecimal
import java.time.LocalDateTime

data class CreatePurchaseRequest(
    @field:NotBlank(message = "Invoice number is required")
    @field:Schema(description = "Unique invoice number for the purchase")
    val invoiceNumber: String,

    @field:NotNull(message = "Supplier ID is required")
    @field:Schema(description = "ID of the supplier")
    val supplierId: Long,

    @field:NotNull(message = "Warehouse ID is required")
    @field:Schema(description = "ID of the warehouse")
    val warehouseId: Long,

    @field:Schema(description = "Purchase date (defaults to current time if not provided)")
    val purchaseDate: LocalDateTime = LocalDateTime.now(),

    @field:Schema(description = "Additional notes about the purchase")
    val notes: String? = null,

    @field:NotNull(message = "Subtotal is required")
    @field:PositiveOrZero(message = "Subtotal must be zero or positive")
    @field:Schema(description = "Subtotal amount before taxes and discounts")
    val subTotal: BigDecimal,

    @field:NotNull(message = "Tax amount is required")
    @field:PositiveOrZero(message = "Tax amount must be zero or positive")
    @field:Schema(description = "Total tax amount")
    val taxAmount: BigDecimal,

    @field:NotNull(message = "Discount amount is required")
    @field:PositiveOrZero(message = "Discount amount must be zero or positive")
    @field:Schema(description = "Total discount amount")
    val discountAmount: BigDecimal,

    @field:NotNull(message = "Total amount is required")
    @field:PositiveOrZero(message = "Total amount must be zero or positive")
    @field:Schema(description = "Total amount to be paid")
    val totalAmount: BigDecimal,

    @field:NotNull(message = "Paid amount is required")
    @field:PositiveOrZero(message = "Paid amount must be zero or positive")
    @field:Schema(description = "Amount already paid")
    val paidAmount: BigDecimal,

    @field:Schema(description = "Payment due date (if applicable)")
    val paymentDueDate: LocalDateTime? = null
)
