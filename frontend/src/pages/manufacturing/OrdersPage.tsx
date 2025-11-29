import {useEffect, useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, CreateProductionOrderRequest, ProductionOrderDto, RecipeDto } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<ProductionOrderDto[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateProductionOrderRequest>({ recipeId: 0, workCenter: 'Qozon-1', plannedQuantity: 0 })
  const [recipes, setRecipes] = useState<RecipeDto[]>([])
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await manufacturingApi.listOrders()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    let mounted = true
    manufacturingApi.listRecipes().then(rs => { if (mounted) setRecipes(rs) })
    return () => { mounted = false }
  }, [])

  const create = async () => {
    if (!form.recipeId) {
      toast({ variant: 'destructive', title: 'Recipe required' })
      return
    }
    if (form.plannedQuantity <= 0) {
      toast({ variant: 'destructive', title: 'Planned quantity must be > 0' })
      return
    }
    try {
      await manufacturingApi.createOrder(form)
      toast({ title: 'Order created' })
      setForm({ recipeId: 0, workCenter: 'Qozon-1', plannedQuantity: 0 })
      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to create order' })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Orders</h1>
          <p className="text-muted-foreground">Manage and track batches</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Order</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Select value={form.recipeId ? String(form.recipeId) : ''} onValueChange={(v) => setForm(f => ({...f, recipeId: Number(v)}))}>
            <SelectTrigger>
              <SelectValue placeholder="Select recipe" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map(r => (
                <SelectItem key={r.id} value={String(r.id)}>{r.name} v{r.version}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Work Center" value={form.workCenter} onChange={e => setForm(f => ({...f, workCenter: e.target.value}))} />
          <Input placeholder="Planned Quantity" type="number" value={form.plannedQuantity || ''} onChange={e => setForm(f => ({...f, plannedQuantity: Number(e.target.value)}))} />
          <Button onClick={create} disabled={loading}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Work Center</TableHead>
                  <TableHead>Planned</TableHead>
                  <TableHead>Produced</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading ? [] : orders).map(o => (
                  <TableRow key={o.id}>
                    <TableCell>#{o.id}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>{o.recipeId}</TableCell>
                    <TableCell>{o.workCenter}</TableCell>
                    <TableCell>{o.plannedQuantity}</TableCell>
                    <TableCell>{o.producedQuantity}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/manufacturing/orders/${o.id}`)}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No orders</TableCell>
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
