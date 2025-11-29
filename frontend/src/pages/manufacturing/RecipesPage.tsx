import {useEffect, useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, RecipeDto } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

export default function RecipesPage() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<RecipeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    manufacturingApi.listRecipes()
      .then(d => {
        if (!mounted) return
        setRecipes(d)
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const filtered = recipes.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()))

  const handleAddCompleted = async (recipe: RecipeDto) => {
    if (!recipe.id) return
    const value = window.prompt('Add produced quantity (must be > 0):')
    if (value === null) return
    const amount = Number(value)
    if (!value || isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' })
      return
    }
    try {
      const updated = await manufacturingApi.addCompletedQuantity(recipe.id, amount)
      setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))
      toast({ title: 'Quantity added', description: `+${amount}` })
    } catch (e:any) {
      toast({ variant: 'destructive', title: e?.message || 'Failed to add quantity' })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Tech cards</p>
        </div>
        <Button onClick={() => navigate('/manufacturing/recipes/new')}>New Recipe</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3"><Input placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Output Qty</TableHead>
                  <TableHead className="text-right">Total Produced</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Estimate cost</TableHead>
                  <TableHead className="text-right">Completion %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading ? [] : filtered).map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.productId}</TableCell>
                    <TableCell>{r.outputQuantity}</TableCell>
                    <TableCell className="text-right">{r.totalProduced ?? 0}</TableCell>
                    <TableCell className="text-right">{r.totalOrders ?? 0}</TableCell>
                    <TableCell className="text-right">{r.estimatedCost ?? 0}</TableCell>
                    <TableCell className="text-right">{Number(r.completionPercentage ?? 0).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="secondary" size="sm" onClick={() => handleAddCompleted(r)}>Add Output</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/manufacturing/recipes/${r.id}`)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          try {
                            const dup = await manufacturingApi.duplicateRecipe(r.id!)
                            toast({ title: 'Recipe duplicated', description: dup?.name })
                            // Refresh list
                            const list = await manufacturingApi.listRecipes()
                            setRecipes(list)
                          } catch (e:any) {
                            toast({ variant: 'destructive', title: e?.message || 'Duplicate failed' })
                          }
                        }}>Duplicate</Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          if (!window.confirm('Delete this recipe?')) return
                          try {
                            await manufacturingApi.deleteRecipe(r.id!)
                            toast({ title: 'Recipe deleted' })
                            // Refresh list
                            const list = await manufacturingApi.listRecipes()
                            setRecipes(list)
                          } catch (e:any) {
                            toast({ variant: 'destructive', title: e?.message || 'Delete failed' })
                          }
                        }}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No recipes</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
