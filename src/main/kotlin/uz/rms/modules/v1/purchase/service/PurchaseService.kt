package uz.rms.modules.v1.purchase.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import uz.rms.modules.v1.purchase.dto.CreatePurchaseRequest
import uz.rms.modules.v1.purchase.dto.PurchaseResponse
import uz.rms.modules.v1.purchase.dto.UpdatePurchaseRequest
import uz.rms.modules.v1.purchase.model.PurchaseStatus
import java.math.BigDecimal

interface PurchaseService {
    /**
     * Create a new purchase
     */
    fun createPurchase(request: CreatePurchaseRequest): PurchaseResponse

    /**
     * Get purchase by ID
     */
    fun getPurchaseById(id: Long): PurchaseResponse

    /**
     * Get all purchases with pagination and filtering
     */
    fun getAllPurchases(
        status: PurchaseStatus?,
        supplierId: Long?,
        startDate: String?,
        endDate: String?,
        pageable: Pageable
    ): Page<PurchaseResponse>


    /**
     * Update an existing purchase
     */
    fun updatePurchase(id: Long, request: UpdatePurchaseRequest): PurchaseResponse

    /**
     * Delete a purchase
     */
    fun deletePurchase(id: Long)


    /**
     * Update purchase status
     */
    fun updateStatus(id: Long, status: PurchaseStatus): PurchaseResponse

    /**
     * Record a payment for a purchase
     */
    fun recordPayment(id: Long, amount: BigDecimal, notes: String? = null): PurchaseResponse

    /**
     * Mark purchase as received
     */
    fun markAsReceived(id: Long, notes: String? = null): PurchaseResponse
}
