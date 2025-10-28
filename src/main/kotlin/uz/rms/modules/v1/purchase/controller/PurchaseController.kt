package uz.rms.modules.v1.purchase.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse


import uz.rms.modules.v1.purchase.dto.CreatePurchaseRequest
import uz.rms.modules.v1.purchase.dto.PurchaseResponse
import uz.rms.modules.v1.purchase.dto.UpdatePurchaseRequest
import uz.rms.modules.v1.purchase.model.PurchaseStatus
import uz.rms.modules.v1.purchase.service.PurchaseService
import java.math.BigDecimal

@RestController
@RequestMapping("/api/v1/purchases")
@Tag(name = "Purchase Management", description = "APIs for managing purchases")
class PurchaseController(
    private val purchaseService: PurchaseService
) {

    @Operation(
        summary = "Create a new purchase",
        description = "Creates a new purchase with the provided details"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "201",
                description = "Purchase created successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "400", description = "Invalid input")
        ]
    )
    @PostMapping
    fun createPurchase(
        @RequestBody request: CreatePurchaseRequest
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val purchase = purchaseService.createPurchase(request)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Purchase created successfully", purchase))
    }

    @Operation(
        summary = "Get purchase by ID",
        description = "Returns a single purchase by its ID"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Purchase found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @GetMapping("/{id}")
    fun getPurchase(
        @Parameter(description = "ID of the purchase to retrieve", required = true)
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val purchase = purchaseService.getPurchaseById(id)
        return ResponseEntity.ok(ApiResponse.success("Purchase retrieved successfully", purchase))
    }

    @Operation(
        summary = "Get all purchases",
        description = "Returns a paginated list of purchases with optional filtering"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "List of purchases",
                content = [Content(mediaType = "application/json")]
            )
        ]
    )
    @GetMapping
    fun getAllPurchases(
        @Parameter(description = "Filter by status", required = false, `in` = ParameterIn.QUERY)
        @RequestParam(required = false) status: PurchaseStatus?,
        
        @Parameter(description = "Filter by supplier ID", required = false, `in` = ParameterIn.QUERY)
        @RequestParam(required = false) supplierId: Long?,
        
        @Parameter(description = "Start date (format: yyyy-MM-dd)", required = false, `in` = ParameterIn.QUERY)
        @RequestParam(required = false) startDate: String?,
        
        @Parameter(description = "End date (format: yyyy-MM-dd)", required = false, `in` = ParameterIn.QUERY)
        @RequestParam(required = false) endDate: String?,
        
        @Parameter(hidden = true)
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<PurchaseResponse>>> {
        val purchases = purchaseService.getAllPurchases(status, supplierId, startDate, endDate, pageable)
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved successfully", purchases))
    }

    @Operation(
        summary = "Update a purchase",
        description = "Updates an existing purchase with the provided details"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Purchase updated successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @PutMapping("/{id}")
    fun updatePurchase(
        @Parameter(description = "ID of the purchase to update", required = true)
        @PathVariable id: Long,
        
        @RequestBody request: UpdatePurchaseRequest
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val updatedPurchase = purchaseService.updatePurchase(id, request)
        return ResponseEntity.ok(ApiResponse.success("Purchase updated successfully", updatedPurchase))
    }

    @Operation(
        summary = "Delete a purchase",
        description = "Deletes a purchase by its ID"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "204", description = "Purchase deleted successfully"),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @DeleteMapping("/{id}")
    fun deletePurchase(
        @Parameter(description = "ID of the purchase to delete", required = true)
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        purchaseService.deletePurchase(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Update purchase status",
        description = "Updates the status of a purchase"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Purchase status updated successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @PatchMapping("/{id}/status")
    fun updateStatus(
        @Parameter(description = "ID of the purchase", required = true)
        @PathVariable id: Long,
        
        @Parameter(description = "New status for the purchase", required = true)
        @RequestParam status: PurchaseStatus
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val updatedPurchase = purchaseService.updateStatus(id, status)
        return ResponseEntity.ok(ApiResponse.success("Purchase status updated successfully", updatedPurchase))
    }

    @Operation(
        summary = "Record a payment for a purchase",
        description = "Records a payment made towards a purchase"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Payment recorded successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "400", description = "Invalid payment amount"),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @PostMapping("/{id}/payments")
    fun recordPayment(
        @Parameter(description = "ID of the purchase", required = true)
        @PathVariable id: Long,
        
        @Parameter(description = "Payment amount", required = true)
        @RequestParam amount: BigDecimal,
        
        @Parameter(description = "Optional payment notes")
        @RequestParam(required = false) notes: String?
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val updatedPurchase = purchaseService.recordPayment(id, amount, notes)
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", updatedPurchase))
    }

    @Operation(
        summary = "Mark purchase as received",
        description = "Marks a purchase as received in the warehouse"
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Purchase marked as received",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(responseCode = "404", description = "Purchase not found")
        ]
    )
    @PostMapping("/{id}/receive")
    fun markAsReceived(
        @Parameter(description = "ID of the purchase", required = true)
        @PathVariable id: Long,
        
        @Parameter(description = "Optional notes about the receipt")
        @RequestParam(required = false) notes: String?
    ): ResponseEntity<ApiResponse<PurchaseResponse>> {
        val updatedPurchase = purchaseService.markAsReceived(id, notes)
        return ResponseEntity.ok(ApiResponse.success("Purchase marked as received", updatedPurchase))
    }
}
