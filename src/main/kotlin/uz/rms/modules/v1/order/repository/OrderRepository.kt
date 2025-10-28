package uz.rms.modules.v1.order.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.order.model.Order
import uz.rms.modules.v1.order.model.OrderStatus
import uz.rms.modules.v1.order.model.PaymentStatus
import java.time.LocalDateTime
import java.util.UUID

@Repository
interface OrderRepository : JpaRepository<Order, Long> {

    @Query("""
        SELECT o,i,u,p,ct,c FROM Order o
        LEFT JOIN FETCH o.user u
        LEFT JOIN FETCH u.roles
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product p
        LEFT JOIN FETCH p.category ct
        LEFT JOIN FETCH o.customer c
        WHERE o.id = :id
    """)
    fun findByOrderNumber(id: Number): Order?

    @Query("""
        SELECT o,i,u,p,ct,c FROM Order o
        LEFT JOIN  FETCH o.user u
        LEFT JOIN  FETCH u.roles
        LEFT JOIN  FETCH o.items i
        LEFT JOIN  FETCH i.product p 
        LEFT JOIN  FETCH p.category ct
        LEFT JOIN  FETCH o.customer c
    """)
    fun findAllOrders(): List<Order>

    @Query("""
        SELECT DISTINCT o FROM Order o 
        LEFT JOIN FETCH o.user u
        LEFT JOIN FETCH u.roles
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product p
        WHERE u.id = :userId 
    """)
    @EntityGraph(attributePaths = ["user", "user.roles", "items", "items.product"])
    fun findByUser(@Param("userId") userId: Long, pageable: Pageable): Page<Order>

    @Query("""
        SELECT o FROM Order o 
        WHERE o.orderDate BETWEEN :startDate AND :endDate
        AND (:status IS NULL OR o.status = :status)
        AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)
        ORDER BY o.orderDate DESC
    """)
    fun searchOrders(
        @Param("startDate") startDate: LocalDateTime,
        @Param("endDate") endDate: LocalDateTime,
        @Param("status") status: OrderStatus? = null,
        @Param("paymentStatus") paymentStatus: PaymentStatus? = null,
        pageable: Pageable
    ): Page<Order>

    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    fun findByIdWithItems(@Param("id") id: UUID): Order?
}