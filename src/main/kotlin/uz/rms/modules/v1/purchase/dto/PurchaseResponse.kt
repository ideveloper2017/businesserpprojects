package uz.rms.modules.v1.purchase.dto

import io.swagger.v3.oas.annotations.media.Schema
import uz.rms.modules.v1.purchase.model.Purchase
import uz.rms.modules.v1.purchase.model.PurchaseStatus
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Purchase response DTO")
data class PurchaseResponse(
    @field:Schema(description = "Unique identifier of the purchase")
    val id: Long,

    @field:Schema(description = "Invoice number of the purchase")
    val invoiceNumber: String,

    @field:Schema(description = "ID of the supplier")
    val supplierId: Long,

    @field:Schema(description = "ID of the warehouse")
    val warehouseId: Long,
    @field:Schema(description = "Date and time when the purchase was made")
    val purchaseDate: LocalDateTime,
    @field:Schema(description = "Additional notes about the purchase", nullable = true)
    val notes: String?,
    @field:Schema(description = "Subtotal amount before taxes and discounts")
    val subTotal: BigDecimal,
    @field:Schema(description = "Total tax amount")
    val taxAmount: BigDecimal,
    @field:Schema(description = "Total discount amount")
    val discountAmount: BigDecimal,
    @field:Schema(description = "Total amount to be paid")
    val totalAmount: BigDecimal,
    @field:Schema(description = "Amount already paid")
    val paidAmount: BigDecimal,
    @field:Schema(description = "Remaining amount to be paid")
    val dueAmount: BigDecimal,
    @field:Schema(description = "Current status of the purchase")
    val status: PurchaseStatus,
    @field:Schema(description = "Whether the purchase is fully paid")
    val isPaid: Boolean,
    @field:Schema(description = "Whether the items have been received")
    val isReceived: Boolean,
    @field:Schema(description = "Due date for payment if applicable", nullable = true)
    val paymentDueDate: LocalDateTime?,
    @field:Schema(description = "Date and time when the purchase was created")
    val createdAt: LocalDateTime?,
    @field:Schema(description = "Date and time when the purchase was last updated")
    val updatedAt: LocalDateTime?
) {
    companion object {
        fun fromEntity(purchase: Purchase): PurchaseResponse {
            return PurchaseResponse(
                id = purchase.id!!,
                invoiceNumber = purchase.invoiceNumber,
                supplierId = purchase.supplier.id!!,
                warehouseId = purchase.warehouse.id!!,
                purchaseDate = purchase.purchaseDate,
                notes = purchase.notes,
                subTotal = purchase.subTotal,
                taxAmount = purchase.taxAmount,
                discountAmount = purchase.discountAmount,
                totalAmount = purchase.totalAmount,
                paidAmount = purchase.paidAmount,
                dueAmount = purchase.dueAmount,
                status = purchase.status,
                isPaid = purchase.isPaid,
                isReceived = purchase.isReceived,
                paymentDueDate = purchase.paymentDueDate,
                createdAt = purchase.createdAt,
                updatedAt = purchase.updatedAt
            )
        }
    }
}
