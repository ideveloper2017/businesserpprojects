package uz.rms.modules.v1.manufacturing.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.manufacturing.dto.*
import uz.rms.modules.v1.manufacturing.model.ProductionOrderStatus
import uz.rms.modules.v1.manufacturing.service.ManufacturingService

@RestController
@RequestMapping("/api/v1/manufacturing")
@Tag(name = "Manufacturing", description = "Manufacturing (recipes, production orders, issues, outputs)")
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
