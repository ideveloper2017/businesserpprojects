package uz.rms.modules.v1.manufacturing.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.manufacturing.dto.*
import uz.rms.modules.v1.manufacturing.model.*
import uz.rms.modules.v1.manufacturing.repository.*
import uz.rms.modules.v1.product.service.ProductService
import java.math.BigDecimal

@Service
class ManufacturingService(
    private val recipeRepository: RecipeRepository,
    private val recipeItemRepository: RecipeItemRepository,
    private val productionOrderRepository: ProductionOrderRepository,
    private val materialIssueRepository: MaterialIssueRepository,
    private val productionOutputRepository: ProductionOutputRepository,
    private val batchRepository: BatchRepository,
    private val productService: ProductService,
) {

    // region Recipe
    @Transactional
    fun createRecipe(req: CreateRecipeRequest): RecipeDto {
        val recipe = Recipe().apply {
            name = req.name
            productId = req.productId
            outputQuantity = req.outputQuantity
        }
        val saved = recipeRepository.save(recipe)
        val items = req.items.map { it.toEntity(saved) }
        recipeItemRepository.saveAll(items)
        saved.items.addAll(items)
        return saved.toDto()
    }

    @Transactional(readOnly = true)
    fun listRecipes(): List<RecipeDto> = recipeRepository.findAll().map { it.toDto() }
    // endregion

    // region Production Orders
    @Transactional
    fun createProductionOrder(req: CreateProductionOrderRequest): ProductionOrderDto {
        val order = ProductionOrder().apply {
            status = ProductionOrderStatus.DRAFT
            recipeId = req.recipeId
            workCenter = req.workCenter
            plannedQuantity = req.plannedQuantity
            producedQuantity = BigDecimal.ZERO
        }
        return productionOrderRepository.save(order).toDto()
    }

    @Transactional
    fun changeOrderStatus(orderId: Long, status: ProductionOrderStatus): ProductionOrderDto {
        val order = productionOrderRepository.findById(orderId).orElseThrow { NoSuchElementException("Order not found") }
        order.status = status
        return productionOrderRepository.save(order).toDto()
    }

    @Transactional(readOnly = true)
    fun getOrder(orderId: Long): ProductionOrderDto =
        productionOrderRepository.findById(orderId).orElseThrow { NoSuchElementException("Order not found") }.toDto()
    
    @Transactional(readOnly = true)
    fun listOrders(): List<ProductionOrderDto> =
        productionOrderRepository.findAll().map { it.toDto() }
    // endregion

    // region Issue / Output
    @Transactional
    fun issueMaterials(orderId: Long, req: IssueMaterialsRequest) {
        val order = productionOrderRepository.findById(orderId).orElseThrow { NoSuchElementException("Order not found") }
        val issues = req.items.map { item ->
            MaterialIssue().apply {
                productionOrder = order
                productId = item.productId
                quantity = item.quantity
                batchNumber = item.batchNumber
                expiryDate = item.expiryDate
            }
        }
        materialIssueRepository.saveAll(issues)
        // Inventory minus
        req.items.forEach { item ->
            val qty = item.quantity.toInt()
            if (qty != 0) productService.updateStock(item.productId, -qty)
        }
    }

    @Transactional
    fun receiveOutput(orderId: Long, req: ReceiveOutputRequest) {
        val order = productionOrderRepository.findById(orderId).orElseThrow { NoSuchElementException("Order not found") }
        val outputs = req.items.map { item ->
            ProductionOutput().apply {
                productionOrder = order
                productId = item.productId
                quantity = item.quantity
                batchNumber = item.batchNumber
                expiryDate = item.expiryDate
            }
        }
        productionOutputRepository.saveAll(outputs)

        // Update produced quantity
        order.producedQuantity = order.producedQuantity + req.items.fold(BigDecimal.ZERO) { acc, it -> acc + it.quantity }
        productionOrderRepository.save(order)

        // Batches
        req.items.forEach { item ->
            if (!item.batchNumber.isNullOrBlank()) {
                val batch = Batch().apply {
                    productId = item.productId
                    batchNumber = item.batchNumber
                    expiryDate = item.expiryDate
                }
                batchRepository.save(batch)
            }
        }
        // Inventory plus
        req.items.forEach { item ->
            val qty = item.quantity.toInt()
            if (qty != 0) productService.updateStock(item.productId, qty)
        }
    }
    // endregion
}

// region Mappers
private fun RecipeItemDto.toEntity(parent: Recipe) = RecipeItem().apply {
    recipe = parent
    productId = this@toEntity.productId
    quantity = this@toEntity.quantity
    uom = this@toEntity.uom
    lossPercent = this@toEntity.lossPercent
}

private fun Recipe.toDto() = RecipeDto(
    id = this.id,
    name = this.name,
    productId = this.productId,
    outputQuantity = this.outputQuantity,
    items = this.items.map { it.toDto() }
)

private fun RecipeItem.toDto() = RecipeItemDto(
    productId = this.productId,
    quantity = this.quantity,
    uom = this.uom,
    lossPercent = this.lossPercent
)

private fun ProductionOrder.toDto() = ProductionOrderDto(
    id = this.id,
    status = this.status.name,
    recipeId = this.recipeId,
    workCenter = this.workCenter,
    plannedQuantity = this.plannedQuantity,
    producedQuantity = this.producedQuantity
)
// endregion
