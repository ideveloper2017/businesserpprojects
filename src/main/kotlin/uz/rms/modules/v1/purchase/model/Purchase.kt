package uz.rms.modules.v1.purchase.model

import jakarta.persistence.*
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.supplier.model.Supplier
import uz.rms.modules.v1.warehouse.model.Warehouse
import java.math.BigDecimal
import java.time.LocalDateTime

enum class PurchaseStatus {
    PAID,
    DRAFT,
    PENDING,
    ORDERED,
    RECEIVED,
    PARTIALLY_RECEIVED,
    CANCELLED,
    RETURNED
}

@Entity
@Table(name = "purchases")
class Purchase : BaseEntity() {
    @Column(nullable = false, unique = true)
    lateinit var invoiceNumber: String

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    lateinit var supplier: Supplier

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    lateinit var warehouse: Warehouse

    @Column(nullable = false)
    var purchaseDate: LocalDateTime = LocalDateTime.now()

    @Column(columnDefinition = "TEXT")
    var notes: String? = null

    @Column(nullable = false, precision = 12, scale = 2)
    var subTotal: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 12, scale = 2)
    var taxAmount: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 12, scale = 2)
    var discountAmount: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false, precision = 12, scale = 2)
    var totalAmount: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false)
    var paidAmount: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false)
    var dueAmount: BigDecimal = BigDecimal.ZERO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: PurchaseStatus = PurchaseStatus.PENDING

    @Column(nullable = false)
    var isPaid: Boolean = false

    @Column(name = "is_received")
    var isReceived: Boolean = false

    @Column(name = "payment_due_date")
    var paymentDueDate: LocalDateTime? = null

}


