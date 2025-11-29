package uz.rms.modules.v1.manufacturing.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.manufacturing.dto.*
import uz.rms.modules.v1.manufacturing.model.ProductionOrderStatus
import uz.rms.modules.v1.manufacturing.service.ManufacturingService
import java.time.Instant

@RestController
@RequestMapping("/api/v1/manufacturing")
@Tag(name = "Manufacturing", description = "Manufacturing (recipes, production orders, issues, outputs)")
@SecurityRequirement(name = "bearerAuth")
class ManufacturingController(
    private val service: ManufacturingService
) {
    // Recipes
    @PostMapping("/recipes")
    @Operation(summary = "Create recipe (tech card)")
    fun createRecipe(@RequestBody req: CreateRecipeRequest): ResponseEntity<ApiResponse<RecipeDto>> {
        val result = service.createRecipe(req)
        return ResponseEntity.ok(ApiResponse.success("Recipe created", result))
    }

    @GetMapping("/recipes")
    @Operation(summary = "List recipes")
    fun listRecipes(): ResponseEntity<ApiResponse<List<RecipeDto>>> {
        val result = service.listRecipes()
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @GetMapping("/recipes/{id}")
    @Operation(summary = "Get recipe by ID")
    fun getRecipe(@PathVariable id: Long): ResponseEntity<ApiResponse<RecipeDto>> {
        val result = service.getRecipe(id)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/recipes/{id}")
    @Operation(summary = "Update recipe")
    fun updateRecipe(@PathVariable id: Long, @RequestBody req: UpdateRecipeRequest): ResponseEntity<ApiResponse<RecipeDto>> {
        val result = service.updateRecipe(id, req)
        return ResponseEntity.ok(ApiResponse.success("Recipe updated", result))
    }

    @DeleteMapping("/recipes/{id}")
    @Operation(summary = "Delete recipe")
    fun deleteRecipe(@PathVariable id: Long): ResponseEntity<ApiResponse<Void>> {
        service.deleteRecipe(id)
        return ResponseEntity.ok(ApiResponse.success("Recipe deleted", null))
    }

    @PostMapping("/recipes/{id}/duplicate")
    @Operation(summary = "Duplicate recipe")
    fun duplicateRecipe(@PathVariable id: Long): ResponseEntity<ApiResponse<RecipeDto>> {
        val result = service.duplicateRecipe(id)
        return ResponseEntity.ok(ApiResponse.success("Recipe duplicated", result))
    }

    @PostMapping("/recipes/{id}/completed")
    @Operation(summary = "Add completed quantity to recipe")
    fun addCompletedQuantity(
        @PathVariable id: Long,
        @RequestBody req: AdjustCompletedQuantityRequest
    ): ResponseEntity<ApiResponse<RecipeDto>> {
        val result = service.addCompletedQuantity(id, req.amount)
        return ResponseEntity.ok(ApiResponse.success("Completed quantity updated", result))
    }

    // Production Orders
    @PostMapping("/orders")
    @Operation(summary = "Create production order")
    fun createOrder(@RequestBody req: CreateProductionOrderRequest): ResponseEntity<ApiResponse<ProductionOrderDto>> {
        val result = service.createProductionOrder(req)
        return ResponseEntity.ok(ApiResponse.success("Order created", result))
    }

    @GetMapping("/orders")
    @Operation(summary = "List production orders")
    fun listOrders(): ResponseEntity<ApiResponse<List<ProductionOrderDto>>> {
        val result = service.listOrders()
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @GetMapping("/orders/page")
    @Operation(summary = "List production orders (pageable)")
    fun listOrdersPage(
        @RequestParam(required = false) status: ProductionOrderStatus?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) from: Instant?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) to: Instant?,
        pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<ProductionOrderDto>>> {
        val page = service.listOrdersPage(status, from, to, pageable)
        return ResponseEntity.ok(ApiResponse.success(page))
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get production order")
    fun getOrder(@PathVariable id: Long): ResponseEntity<ApiResponse<ProductionOrderDto>> {
        val result = service.getOrder(id)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Change order status")
    fun changeStatus(
        @PathVariable id: Long,
        @RequestParam status: ProductionOrderStatus
    ): ResponseEntity<ApiResponse<ProductionOrderDto>> {
        val result = service.changeOrderStatus(id, status)
        return ResponseEntity.ok(ApiResponse.success("Status updated", result))
    }

    // Issue / Output
    @PostMapping("/orders/{id}/issue")
    @Operation(summary = "Issue materials to order")
    fun issueMaterials(
        @PathVariable id: Long,
        @RequestBody req: IssueMaterialsRequest
    ): ResponseEntity<ApiResponse<Void>> {
        service.issueMaterials(id, req)
        return ResponseEntity.ok(ApiResponse.success("Materials issued", null))
    }

    @PostMapping("/orders/{id}/output")
    @Operation(summary = "Receive production output")
    fun receiveOutput(
        @PathVariable id: Long,
        @RequestBody req: ReceiveOutputRequest
    ): ResponseEntity<ApiResponse<Void>> {
        service.receiveOutput(id, req)
        return ResponseEntity.ok(ApiResponse.success("Output received", null))
    }
}
