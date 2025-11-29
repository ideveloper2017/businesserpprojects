package uz.rms.modules.v1.manufacturing.service

import org.springframework.stereotype.Service
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.manufacturing.dto.*
import uz.rms.modules.v1.manufacturing.model.*
import uz.rms.modules.v1.manufacturing.repository.*
import uz.rms.modules.v1.product.service.ProductService
import java.math.BigDecimal
import java.time.Instant

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
            yield = req.yield
            laborCost = req.laborCost
            overheadCost = req.overheadCost
        }
        val saved = recipeRepository.save(recipe)
        val items = req.items.map { it.toEntity(saved) }
        recipeItemRepository.saveAll(items)
        saved.items.addAll(items)
        return mapRecipeToDto(saved)
    }

    @Transactional(readOnly = true)
    fun listRecipes(): List<RecipeDto> = recipeRepository.findAll().map { mapRecipeToDto(it) }

    @Transactional(readOnly = true)
    fun getRecipe(id: Long): RecipeDto =
        recipeRepository.findById(id).orElseThrow { NoSuchElementException("Recipe not found") }.let { mapRecipeToDto(it) }

    @Transactional
    fun updateRecipe(id: Long, req: UpdateRecipeRequest): RecipeDto {
        val recipe = recipeRepository.findById(id).orElseThrow { NoSuchElementException("Recipe not found") }
        recipe.name = req.name
        recipe.productId = req.productId
        recipe.outputQuantity = req.outputQuantity
        recipe.yield = req.yield
        recipe.laborCost = req.laborCost
        recipe.overheadCost = req.overheadCost
        // replace items
        val existing = recipe.items.toList()
        existing.forEach { recipeItemRepository.delete(it) }
        recipe.items.clear()
        val newItems = req.items.map { it.toEntity(recipe) }
        recipeItemRepository.saveAll(newItems)
        recipe.items.addAll(newItems)
        val saved = recipeRepository.save(recipe)
        return mapRecipeToDto(saved)
    }

    @Transactional
    fun deleteRecipe(id: Long) {
        val recipe = recipeRepository.findById(id).orElseThrow { NoSuchElementException("Recipe not found") }
        // JPA orphanRemoval=true already removes items, but ensure explicit cleanup
        recipe.items.forEach { recipeItemRepository.delete(it) }
        recipeRepository.delete(recipe)
    }

    @Transactional
    fun duplicateRecipe(id: Long): RecipeDto {
        val src = recipeRepository.findById(id).orElseThrow { NoSuchElementException("Recipe not found") }
        val copy = Recipe().apply {
            name = "Copy of ${'$'}{src.name}"
            productId = src.productId
            outputQuantity = src.outputQuantity
            yield = src.yield
            laborCost = src.laborCost
            overheadCost = src.overheadCost
        }
        val saved = recipeRepository.save(copy)
        val items = src.items.map { si ->
            RecipeItem().apply {
                recipe = saved
                productId = si.productId
                quantity = si.quantity
                uom = si.uom
                lossPercent = si.lossPercent
            }
        }
        recipeItemRepository.saveAll(items)
        saved.items.addAll(items)
        return mapRecipeToDto(saved)
    }

    @Transactional
    fun addCompletedQuantity(recipeId: Long, amount: BigDecimal): RecipeDto {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw IllegalArgumentException("Amount must be greater than zero")
        }
        val recipe = recipeRepository.findById(recipeId).orElseThrow { NoSuchElementException("Recipe not found") }
        recipe.completedQuantity = recipe.completedQuantity + amount
        val saved = recipeRepository.save(recipe)
        return mapRecipeToDto(saved)
    }
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

    @Transactional(readOnly = true)
    fun listOrdersPage(
        status: ProductionOrderStatus?,
        from: Instant?,
        to: Instant?,
        pageable: Pageable
    ): Page<ProductionOrderDto> {
        val page = when {
            status != null && from != null && to != null -> productionOrderRepository.findAllByStatusAndCreatedAtBetween(status, from, to, pageable)
            status != null && from == null && to == null -> productionOrderRepository.findAllByStatus(status, pageable)
            status == null && from != null && to != null -> productionOrderRepository.findAllByCreatedAtBetween(from, to, pageable)
            else -> productionOrderRepository.findAll(pageable)
        }
        return page.map { it.toDto() }
    }
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
    // region Mappers
    private fun mapRecipeToDto(recipe: Recipe): RecipeDto {
        val itemsCost = recipe.items.fold(BigDecimal.ZERO) { acc, it ->
            val prod = productService.getProductById(it.productId)
            acc + (it.quantity.multiply(prod.costPrice))
        }
        val yieldSafe = if (recipe.yield.compareTo(BigDecimal.ZERO) == 0) BigDecimal.ONE else recipe.yield
        val converted = itemsCost.divide(yieldSafe, 4, java.math.RoundingMode.HALF_UP)
        val est = converted + recipe.laborCost + recipe.overheadCost
        
        // Get statistics for this recipe
        val stats = recipeRepository.getRecipeStats(recipe.id!!)
        val manualCompleted = recipe.completedQuantity
        val totalOrders = stats.totalOrders
        val targetQuantity = recipe.outputQuantity.multiply(BigDecimal(totalOrders))
        val completionFromManual = if (targetQuantity.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal.ZERO
        } else {
            manualCompleted.multiply(BigDecimal(100)).divide(targetQuantity, 2, java.math.RoundingMode.HALF_UP)
        }

        return RecipeDto(
            id = recipe.id,
            name = recipe.name,
            productId = recipe.productId,
            outputQuantity = recipe.outputQuantity,
            yield = recipe.yield,
            laborCost = recipe.laborCost,
            overheadCost = recipe.overheadCost,
            estimatedCost = est,
            totalProduced = manualCompleted,
            totalOrders = totalOrders,
            completedOrders = stats.completedOrders,
            completionPercentage = completionFromManual,
            items = recipe.items.map { it.toDto() }
        )
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

// moved mapRecipeToDto into class

private fun RecipeItem.toDto() = RecipeItemDto(
    productId = this.productId,
    quantity = this.quantity,
    uom = this.uom,
    lossPercent = this.lossPercent
)

// computeEstimatedCost inlined in mapRecipeToDto using ProductService

private fun ProductionOrder.toDto() = ProductionOrderDto(
    id = this.id,
    status = this.status.name,
    recipeId = this.recipeId,
    workCenter = this.workCenter,
    plannedQuantity = this.plannedQuantity,
    producedQuantity = this.producedQuantity
)
// endregion
