package uz.rms.modules.v1.purchase.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.purchase.dto.CreatePurchaseRequest
import uz.rms.modules.v1.purchase.dto.PurchaseResponse
import uz.rms.modules.v1.purchase.dto.UpdatePurchaseRequest
import uz.rms.modules.v1.purchase.mapper.PurchaseMapper
import uz.rms.modules.v1.purchase.model.Purchase
import uz.rms.modules.v1.purchase.model.PurchaseStatus
import uz.rms.modules.v1.purchase.repository.PurchaseRepository
import uz.rms.modules.v1.supplier.model.Supplier
import uz.rms.modules.v1.supplier.repository.SupplierRepository
import uz.rms.modules.v1.warehouse.model.Warehouse
import uz.rms.modules.v1.warehouse.repository.WarehouseRepository
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
@Transactional
class PurchaseServiceImpl(
    private val purchaseRepository: PurchaseRepository,
    private val supplierRepository: SupplierRepository,
    private val warehouseRepository: WarehouseRepository,
    private val purchaseMapper: PurchaseMapper
) : PurchaseService {

    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    override fun createPurchase(request: CreatePurchaseRequest): PurchaseResponse {
        val supplier = supplierRepository.findByIdOrNull(request.supplierId)
            ?: throw Exception("Supplier not found with id: ${request.supplierId}")

        val warehouse = warehouseRepository.findByIdOrNull(request.warehouseId)
            ?: throw Exception("Warehouse not found with id: ${request.warehouseId}")

        val purchase = purchaseMapper.toEntity(request).apply {
            this.supplier = supplier
            this.warehouse = warehouse
            this.dueAmount = totalAmount - paidAmount
            this.isPaid = paidAmount >= totalAmount
        }

        return purchaseMapper.toDto(purchaseRepository.save(purchase))
    }

    @Transactional(readOnly = true)
    override fun getPurchaseById(id: Long): PurchaseResponse {
        return purchaseMapper.toDto(findPurchaseById(id))
    }

    @Transactional(readOnly = true)
    override fun getAllPurchases(
        status: PurchaseStatus?,
        supplierId: Long?,
        startDate: String?,
        endDate: String?,
        pageable: Pageable
    ): Page<PurchaseResponse> {
        val (start, end) = validateAndParseDates(startDate, endDate)

        return purchaseRepository.findAll(pageable)
            .filter { purchase ->
                (status == null || purchase.status == status) &&
                        (supplierId == null || purchase.supplier.id == supplierId) &&
                        (start == null || !purchase.purchaseDate.isBefore(start)) &&
                        (end == null || !purchase.purchaseDate.isAfter(end))
            }
            .map { purchaseMapper.toDto(it) } as Page<PurchaseResponse>
    }

    override fun updatePurchase(id: Long, request: UpdatePurchaseRequest): PurchaseResponse {
        val purchase = findPurchaseById(id)
        val supplier = request.supplierId?.let {
            supplierRepository.findByIdOrNull(it)
                ?: throw Exception("Supplier not found with id: $it")
        }

        val warehouse = request.warehouseId?.let {
            warehouseRepository.findByIdOrNull(it)
                ?: throw Exception("Warehouse not found with id: $it")
        }

        purchaseMapper.updateEntityFromRequest(request, purchase)

        supplier?.let { purchase.supplier = it }
        warehouse?.let { purchase.warehouse = it }

        // Recalculate due amount and payment status
        purchase.dueAmount = purchase.totalAmount - purchase.paidAmount
        purchase.isPaid = purchase.dueAmount <= BigDecimal.ZERO

        return purchaseMapper.toDto(purchaseRepository.save(purchase))
    }

    override fun deletePurchase(id: Long) {
        val purchase = findPurchaseById(id)

        // Add any business validation before deletion
        // For example, prevent deletion of received or paid purchases
        if (purchase.status == PurchaseStatus.RECEIVED) {
            throw IllegalStateException("Cannot delete a received purchase")
        }

        purchaseRepository.delete(purchase)
    }

    override fun updateStatus(id: Long, status: PurchaseStatus): PurchaseResponse {
        val purchase = findPurchaseById(id)

        // Validate status transition
        when (purchase.status) {
            PurchaseStatus.CANCELLED ->
                throw IllegalStateException("Cannot change status of a cancelled purchase")
            else -> purchase.status = status
        }

        // Additional logic based on status
        if (status == PurchaseStatus.RECEIVED) {
            purchase.isReceived = true
            // TODO: Update inventory here
        }

        return purchaseMapper.toDto(purchaseRepository.save(purchase))
    }

    override fun recordPayment(id: Long, amount: BigDecimal, notes: String?): PurchaseResponse {
        val purchase = findPurchaseById(id)

        if (purchase.status == PurchaseStatus.CANCELLED) {
            throw IllegalStateException("Cannot record payment for a cancelled purchase")
        }

        purchase.paidAmount = purchase.paidAmount.add(amount)
        purchase.dueAmount = purchase.totalAmount - purchase.paidAmount
        purchase.isPaid = purchase.dueAmount <= BigDecimal.ZERO
        purchase.notes = notes ?: purchase.notes

        // Update status if fully paid
        if (purchase.isPaid) {
            purchase.status = PurchaseStatus.PAID
        }

        return purchaseMapper.toDto(purchaseRepository.save(purchase))
    }

    override fun markAsReceived(id: Long, notes: String?): PurchaseResponse {
        val purchase = findPurchaseById(id)

        if (purchase.status == PurchaseStatus.CANCELLED) {
            throw IllegalStateException("Cannot mark a cancelled purchase as received")
        }

        purchase.status = PurchaseStatus.RECEIVED
        purchase.isReceived = true
        purchase.notes = notes ?: purchase.notes

        // TODO: Update inventory here

        return purchaseMapper.toDto(purchaseRepository.save(purchase))
    }

    @Transactional(readOnly = true)
    fun getPurchasesBySupplier(supplierId: Long, pageable: Pageable): Page<PurchaseResponse> {
        if (!supplierRepository.existsById(supplierId)) {
            throw Exception("Supplier not found with id: $supplierId")
        }

        return purchaseRepository.findBySupplierId(supplierId, pageable)
            .map { purchaseMapper.toDto(it) }
    }

    @Transactional(readOnly = true)
    fun getPurchasesByWarehouse(warehouseId: Long, pageable: Pageable): Page<PurchaseResponse> {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw Exception("Warehouse not found with id: $warehouseId")
        }

        return purchaseRepository.findByWarehouseId(warehouseId, pageable)
            .map { purchaseMapper.toDto(it) }
    }

    private fun findPurchaseById(id: Long): Purchase {
        return purchaseRepository.findByIdOrNull(id)
            ?: throw Exception("Purchase not found with id: $id")
    }

    private fun validateAndParseDates(startDate: String?, endDate: String?): Pair<LocalDateTime?, LocalDateTime?> {
        val start = startDate?.let {
            LocalDate.parse(it, dateFormatter).atStartOfDay()
        }

        val end = endDate?.let {
            LocalDate.parse(it, dateFormatter).atTime(23, 59, 59)
        }

        if (start != null && end != null && start.isAfter(end)) {
            throw IllegalArgumentException("Start date cannot be after end date")
        }

        return Pair(start, end)
    }
}