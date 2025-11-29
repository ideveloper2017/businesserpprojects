import {useEffect, useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, productApi, RecipeDto, RecipeItemDto } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RecipeEditorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RecipeDto>({ name: '', productId: 0, outputQuantity: 0, items: [] })
  const [rawMaterials, setRawMaterials] = useState<any[]>([])
  const [listsLoading, setListsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setListsLoading(true)
    productApi.getByType('RAW_MATERIAL', 500)
      .then((rm) => { if (mounted) setRawMaterials(rm) })
      .catch((e:any) => {
        toast({ variant: 'destructive', title: e?.message || 'Failed to load raw materials (auth?)' })
      })
      .finally(() => { if (mounted) setListsLoading(false) })
    return () => { mounted = false }
  }, [])

  const addItem = () => setForm(f => ({...f, items: [...(f.items||[]), { productId: 0, quantity: 0, uom: 'kg', lossPercent: 0 } as RecipeItemDto]}))
  const removeItem = (idx: number) => setForm(f => ({...f, items: f.items.filter((_,i)=> i!==idx)}))

  const save = async () => {
    if (!form.name?.trim()) { toast({ variant: 'destructive', title: 'Name required' }); return }
    if (!form.productId) { toast({ variant: 'destructive', title: 'Product ID required' }); return }
    if (!form.outputQuantity || Number(form.outputQuantity) <= 0) { toast({ variant: 'destructive', title: 'Output qty > 0' }); return }
    if (!form.items.length) { toast({ variant: 'destructive', title: 'Add at least one item' }); return }
    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i]
      if (!it.productId) { toast({ variant: 'destructive', title: `Item #${i+1}: product required` }); return }
      if (!it.quantity || Number(it.quantity) <= 0) { toast({ variant: 'destructive', title: `Item #${i+1}: quantity > 0` }); return }
    }
    setSaving(true)
    try {
      await manufacturingApi.createRecipe(form as any)
      toast({ title: 'Recipe saved' })
      navigate('/manufacturing/recipes')
    } catch(e:any) {
      const msg = e?.message || e?.data?.message || 'Failed to save recipe'
      toast({ variant: 'destructive', title: msg })
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
          <Button onClick={save} disabled={saving || listsLoading || !rawMaterials.length}>Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          <Select value={form.productId ? String(form.productId) : ''} onValueChange={(v) => setForm(f => ({...f, productId: Number(v)}))}>
            <SelectTrigger>
              <SelectValue placeholder="Select raw material" />
            </SelectTrigger>
            <SelectContent>
              {rawMaterials.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name || p.sku || `#${p.id}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      <Select value={it.productId ? String(it.productId) : ''} onValueChange={(v) => {
                        const val = Number(v)
                        setForm(f => ({...f, items: f.items.map((x,i)=> i===idx?{...x, productId: val}:x)}))
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select raw material" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name || p.sku || `#${p.id}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
