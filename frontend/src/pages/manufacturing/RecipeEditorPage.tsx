import {useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, RecipeDto, RecipeItemDto } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

export default function RecipeEditorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RecipeDto>({ name: '', productId: 0, outputQuantity: 0, items: [] })

  const addItem = () => setForm(f => ({...f, items: [...(f.items||[]), { productId: 0, quantity: 0, uom: 'kg', lossPercent: 0 } as RecipeItemDto]}))
  const removeItem = (idx: number) => setForm(f => ({...f, items: f.items.filter((_,i)=> i!==idx)}))

  const save = async () => {
    if (!form.name?.trim()) { toast({ variant: 'destructive', title: 'Name required' }); return }
    if (!form.productId) { toast({ variant: 'destructive', title: 'Product ID required' }); return }
    if (!form.outputQuantity || Number(form.outputQuantity) <= 0) { toast({ variant: 'destructive', title: 'Output qty > 0' }); return }
    if (!form.items.length) { toast({ variant: 'destructive', title: 'Add at least one item' }); return }
    setSaving(true)
    try {
      await manufacturingApi.createRecipe(form)
      toast({ title: 'Recipe saved' })
      navigate('/manufacturing/recipes')
    } catch(e:any) {
      toast({ variant: 'destructive', title: 'Failed to save recipe' })
    } finally { setSaving(false) }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Recipe</h1>
          <p className="text-muted-foreground">Tech card</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          <Input placeholder="Product ID" type="number" value={form.productId || ''} onChange={e => setForm(f => ({...f, productId: Number(e.target.value)}))} />
          <Input placeholder="Output Quantity" type="number" value={form.outputQuantity || ''} onChange={e => setForm(f => ({...f, outputQuantity: Number(e.target.value)}))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Loss %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input type="number" value={it.productId || ''} onChange={e => {
                        const v = Number(e.target.value)
                        setForm(f => ({...f, items: f.items.map((x,i)=> i===idx?{...x, productId: v}:x)}))
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={it.quantity || ''} onChange={e => {
                        const v = Number(e.target.value)
                        setForm(f => ({...f, items: f.items.map((x,i)=> i===idx?{...x, quantity: v}:x)}))
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input value={it.uom} onChange={e => setForm(f => ({...f, items: f.items.map((x,i)=> i===idx?{...x, uom: e.target.value}:x)}))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={it.lossPercent || 0} onChange={e => {
                        const v = Number(e.target.value)
                        setForm(f => ({...f, items: f.items.map((x,i)=> i===idx?{...x, lossPercent: v}:x)}))
                      }} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={addItem}>Add item</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
