package uz.rms.modules.v1.purchase.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.purchase.dto.CreatePurchaseRequest
import uz.rms.modules.v1.purchase.dto.PurchaseResponse
import uz.rms.modules.v1.purchase.dto.UpdatePurchaseRequest
import uz.rms.modules.v1.purchase.model.Purchase
import uz.rms.modules.v1.purchase.model.PurchaseStatus
import java.math.BigDecimal

@Component
class PurchaseMapper {

    fun toEntity(request: CreatePurchaseRequest): Purchase {
        return Purchase().apply {
            invoiceNumber = request.invoiceNumber
            notes = request.notes
            purchaseDate = request.purchaseDate
            subTotal = request.subTotal
            taxAmount = request.taxAmount
            discountAmount = request.discountAmount
            totalAmount = request.totalAmount
            paidAmount = request.paidAmount
            dueAmount = request.totalAmount - request.paidAmount
            status = PurchaseStatus.PENDING
            isPaid = request.paidAmount >= request.totalAmount
            isReceived = false
            paymentDueDate = request.paymentDueDate
        }
    }

    fun toDto(purchase: Purchase): PurchaseResponse {
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
            createdAt = purchase.createdAt!!,
            updatedAt = purchase.updatedAt!!
        )
    }

    fun updateEntityFromRequest(request: UpdatePurchaseRequest, entity: Purchase) {
        request.invoiceNumber?.let { entity.invoiceNumber = it }
        request.notes?.let { entity.notes = it }
        request.purchaseDate?.let { entity.purchaseDate = it }
        request.subTotal?.let { entity.subTotal = it }
        request.taxAmount?.let { entity.taxAmount = it }
        request.discountAmount?.let { entity.discountAmount = it }
        request.totalAmount?.let { entity.totalAmount = it }
        
        request.paidAmount?.let { paidAmount ->
            entity.paidAmount = paidAmount
            entity.dueAmount = (entity.totalAmount - paidAmount).max(BigDecimal.ZERO)
            entity.isPaid = entity.dueAmount <= BigDecimal.ZERO
        }
        
        request.status?.let { entity.status = PurchaseStatus.valueOf(it) }
        request.paymentDueDate?.let { entity.paymentDueDate = it }
    }
}
