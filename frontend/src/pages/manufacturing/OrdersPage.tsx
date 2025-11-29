import {useEffect, useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, CreateProductionOrderRequest, ProductionOrderDto, RecipeDto, SpringPage } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [ordersPage, setOrdersPage] = useState<SpringPage<ProductionOrderDto> | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateProductionOrderRequest>({ recipeId: 0, workCenter: 'Qozon-1', plannedQuantity: 0 })
  const [recipes, setRecipes] = useState<RecipeDto[]>([])
  const { toast } = useToast()
  const [status, setStatus] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const load = async () => {
    setLoading(true)
    try {
      const data = await manufacturingApi.listOrdersPage({ page, size, status: status || undefined, from: from || undefined, to: to || undefined })
      setOrdersPage(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, size])
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
      setPage(0)
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
                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
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
          <div className="grid gap-3 md:grid-cols-5 mb-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="RELEASED">RELEASED</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CLOSED">CLOSED</SelectItem>
              </SelectContent>
            </Select>
            <Input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} />
            <Input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} />
            <Button variant="secondary" onClick={() => { setPage(0); load() }}>Apply</Button>
            <Button variant="ghost" onClick={() => { setStatus(''); setFrom(''); setTo(''); setPage(0); load() }}>Clear</Button>
          </div>
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
                {(loading ? [] : (ordersPage?.content || [])).map(o => (
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
                {!loading && (ordersPage?.content?.length || 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No orders</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-muted-foreground">Page { (ordersPage?.number ?? 0) + 1 } / { ordersPage?.totalPages ?? 1 }</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={(ordersPage?.number ?? 0) <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={((ordersPage?.number ?? 0) + 1) >= (ordersPage?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
