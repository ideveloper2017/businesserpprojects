package uz.rms.modules.v1.manufacturing.repository

import jakarta.persistence.EntityManager
import jakarta.persistence.NoResultException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.manufacturing.model.*
import java.math.BigDecimal
import java.time.Instant

@Repository
interface RecipeRepository : JpaRepository<Recipe, Long>, RecipeRepositoryCustom

interface RecipeRepositoryCustom {
    fun getRecipeStats(recipeId: Long): RecipeStatsDto
    fun getAllRecipesStats(): Map<Long, RecipeStatsDto>
}

@Repository
class RecipeRepositoryImpl(
    private val entityManager: EntityManager
) : RecipeRepositoryCustom {
    override fun getRecipeStats(recipeId: Long): RecipeStatsDto {
        val query = """
            SELECT 
                COALESCE(SUM(po.produced_quantity), 0) as totalProduced,
                COUNT(*) as totalOrders,
                COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) as completedOrders
            FROM production_orders po
            WHERE po.recipe_id = :recipeId
            GROUP BY po.recipe_id
        """.trimIndent()

        return try {
            val result = entityManager.createNativeQuery(query)
                .setParameter("recipeId", recipeId)
                .singleResult as Array<*>
            
            val totalProduced = result[0] as? BigDecimal ?: BigDecimal.ZERO
            val totalOrders = (result[1] as? Number)?.toInt() ?: 0
            val completedOrders = (result[2] as? Number)?.toInt() ?: 0
            RecipeStatsDto(
                totalProduced = totalProduced,
                totalOrders = totalOrders,
                completedOrders = completedOrders,
                completionPercentage = calculateCompletionPercentage(totalOrders, completedOrders)
            )
        } catch (e: NoResultException) {
            RecipeStatsDto(BigDecimal.ZERO, 0, 0, BigDecimal.ZERO)
        }
    }

    override fun getAllRecipesStats(): Map<Long, RecipeStatsDto> {
        val query = """
            SELECT 
                po.recipe_id,
                COALESCE(SUM(po.produced_quantity), 0) as totalProduced,
                COUNT(*) as totalOrders,
                COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) as completedOrders
            FROM production_orders po
            WHERE po.recipe_id IS NOT NULL
            GROUP BY po.recipe_id
        """.trimIndent()

        val results = entityManager.createNativeQuery(query).resultList as List<Array<*>>
        
        return results.associate { row ->
            val recipeId = (row[0] as Number).toLong()
            val totalProduced = row[1] as? BigDecimal ?: BigDecimal.ZERO
            val totalOrders = (row[2] as? Number)?.toInt() ?: 0
            val completedOrders = (row[3] as? Number)?.toInt() ?: 0
            val stats = RecipeStatsDto(
                totalProduced = totalProduced,
                totalOrders = totalOrders,
                completedOrders = completedOrders,
                completionPercentage = calculateCompletionPercentage(totalOrders, completedOrders)
            )
            recipeId to stats
        }
    }
}

data class RecipeStatsDto(
    val totalProduced: BigDecimal,
    val totalOrders: Int,
    val completedOrders: Int,
    val completionPercentage: BigDecimal
)

private fun calculateCompletionPercentage(totalOrders: Int, completedOrders: Int): BigDecimal {
    if (totalOrders == 0) return BigDecimal.ZERO
    return BigDecimal(completedOrders)
        .multiply(BigDecimal(100))
        .divide(BigDecimal(totalOrders), 2, java.math.RoundingMode.HALF_UP)
}

@Repository
interface RecipeItemRepository : JpaRepository<RecipeItem, Long>

@Repository
interface ProductionOrderRepository : JpaRepository<ProductionOrder, Long> {
    fun findAllByStatus(status: ProductionOrderStatus, pageable: Pageable): Page<ProductionOrder>
    fun findAllByCreatedAtBetween(from: Instant, to: Instant, pageable: Pageable): Page<ProductionOrder>
    fun findAllByStatusAndCreatedAtBetween(status: ProductionOrderStatus, from: Instant, to: Instant, pageable: Pageable): Page<ProductionOrder>
}

@Repository
interface MaterialIssueRepository : JpaRepository<MaterialIssue, Long>

@Repository
interface ProductionOutputRepository : JpaRepository<ProductionOutput, Long>

@Repository
interface BatchRepository : JpaRepository<Batch, Long>
