package uz.rms.modules.v1.manufacturing.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.manufacturing.model.*

@Repository
interface RecipeRepository : JpaRepository<Recipe, Long>

@Repository
interface RecipeItemRepository : JpaRepository<RecipeItem, Long>

@Repository
interface ProductionOrderRepository : JpaRepository<ProductionOrder, Long>

@Repository
interface MaterialIssueRepository : JpaRepository<MaterialIssue, Long>

@Repository
interface ProductionOutputRepository : JpaRepository<ProductionOutput, Long>

@Repository
interface BatchRepository : JpaRepository<Batch, Long>
