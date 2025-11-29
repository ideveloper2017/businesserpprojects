package uz.rms.modules.v1.manufacturing.dto

import java.math.BigDecimal
import java.time.LocalDate

// Recipe
data class RecipeItemDto(
    val productId: Long,
    val quantity: BigDecimal,
    val uom: String,
    val lossPercent: BigDecimal
)

data class RecipeDto(
    val id: Long?,
    val name: String,
    val productId: Long,
    val outputQuantity: BigDecimal,
    val items: List<RecipeItemDto>
)

data class CreateRecipeRequest(
    val name: String,
    val version: String,
    val productId: Long,
    val outputQuantity: BigDecimal,
    val items: List<RecipeItemDto>
)

// Production Order

data class CreateProductionOrderRequest(
    val recipeId: Long,
    val workCenter: String,
    val plannedQuantity: BigDecimal
)

data class ProductionOrderDto(
    val id: Long?,
    val status: String,
    val recipeId: Long,
    val workCenter: String,
    val plannedQuantity: BigDecimal,
    val producedQuantity: BigDecimal
)

// Material Issue / Output

data class IssueItemDto(
    val productId: Long,
    val quantity: BigDecimal,
    val batchNumber: String? = null,
    val expiryDate: LocalDate? = null
)

data class IssueMaterialsRequest(
    val items: List<IssueItemDto>
)

data class OutputItemDto(
    val productId: Long,
    val quantity: BigDecimal,
    val batchNumber: String? = null,
    val expiryDate: LocalDate? = null
)

data class ReceiveOutputRequest(
    val items: List<OutputItemDto>
)
