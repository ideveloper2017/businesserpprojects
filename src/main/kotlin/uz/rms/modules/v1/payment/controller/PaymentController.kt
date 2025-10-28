package uz.idev.app.v1.payment.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse as swaggerApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import uz.idev.app.v1.payment.service.PaymentService
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.payment.dto.CreatePaymentRequest
import uz.rms.modules.v1.payment.dto.PaymentDto
import uz.rms.modules.v1.payment.dto.UpdatePaymentRequest
import uz.rms.modules.v1.payment.model.PaymentStatus
import uz.rms.modules.v1.users.domain.User
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Payment management APIs")
@SecurityRequirement(name = "bearerAuth")
class PaymentController(
    private val paymentService: PaymentService
) {

    @GetMapping("/{id}")
    @Operation(
        summary = "Get payment by ID",
        description = "Retrieves a payment by its ID"
    )
    @swaggerApiResponse(
        responseCode = "200",
        description = "Successfully retrieved payment",
        content = [Content(schema = Schema(implementation = ApiResponse::class))]
    )
    fun getPaymentById(
        @Parameter(description = "Payment ID") @PathVariable id: Long
    ): ResponseEntity<ApiResponse<PaymentDto>> {
        val payment = paymentService.getPaymentById(id)
        return ResponseEntity.ok(ApiResponse.success(payment))
    }

    @GetMapping
    @Operation(
        summary = "Search payments",
        description = "Search payments with filtering and pagination"
    )
    fun searchPayments(
        @Parameter(description = "Order ID") @RequestParam(required = false) orderId: Long?,
        @Parameter(description = "Payment status") @RequestParam(required = false) status: PaymentStatus?,
        @Parameter(description = "Start date (yyyy-MM-dd HH:mm:ss)")
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") startDate: LocalDateTime?,
        @Parameter(description = "End date (yyyy-MM-dd HH:mm:ss)")
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") endDate: LocalDateTime?,
        pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<PaymentDto>>> {
        val payments = paymentService.searchPayments(orderId, status as PaymentStatus?, startDate, endDate, pageable)
        return ResponseEntity.ok(ApiResponse.success(payments))
    }

    @GetMapping("/order/{orderId}")
    @Operation(
        summary = "Get payments by order ID",
        description = "Retrieves all payments for a specific order"
    )
    fun getPaymentsByOrderId(
        @Parameter(description = "Order ID") @PathVariable orderId: Long
    ): ResponseEntity<ApiResponse<List<PaymentDto>>> {
        val payments = paymentService.getPaymentsByOrderId(orderId)
        return ResponseEntity.ok(ApiResponse.success(payments))
    }

    @PostMapping
    @Operation(
        summary = "Create a new payment",
        description = "Creates a new payment for an order"
    )
    fun createPayment(
        @RequestBody request: CreatePaymentRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<PaymentDto>?> {
        val payment = paymentService.createPayment(request, user)
        return ResponseEntity.ok(ApiResponse.success( "Payment created successfully",payment))
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update a payment",
        description = "Updates an existing payment"
    )
    fun updatePayment(
        @Parameter(description = "Payment ID") @PathVariable id: Long,
        @RequestBody request: UpdatePaymentRequest
    ): ResponseEntity<ApiResponse<PaymentDto>> {
        val payment = paymentService.updatePayment(id, request)
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully",payment ))
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete a payment",
        description = "Marks a payment as deleted"
    )
    fun deletePayment(
        @Parameter(description = "Payment ID") @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Void>> {
        paymentService.deletePayment(id)
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null, ))
    }

//    @PostMapping("/{id}/refund")
//    @Operation(
//        summary = "Refund a payment",
//        description = "Processes a refund for a completed payment"
//    )
//    fun refundPayment(
//        @Parameter(description = "Payment ID") @PathVariable id: Long,
//        @RequestBody(required = false) request: RefundPaymentRequest?
//    ): ResponseEntity<ApiResponse<PaymentDto>> {
//        val refund = paymentService.refundPayment(id, request?.notes)
//        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully",refund, ))
//    }
}
