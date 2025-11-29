import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {manufacturingApi, RecipeDto} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function RecipeDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const recipeId = useMemo(() => Number(id), [id])
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<RecipeDto | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<RecipeDto | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    if (!recipeId) return
    setLoading(true)
    manufacturingApi.getRecipe(recipeId)
      .then(data => {
        if (!mounted) return
        setRecipe(data)
        setForm(data)
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [recipeId])

  const isValid = !!form && !!form.name && form.outputQuantity > 0 && form.yield > 0 && form.yield <= 1 && form.laborCost >= 0 && form.overheadCost >= 0

  const onChange = (key: keyof RecipeDto, val: any) => {
    setForm(prev => prev ? { ...prev, [key]: val } as RecipeDto : prev)
  }

  const onSave = async () => {
    if (!form?.id) return
    if (!isValid) return
    try {
      setSaving(true)
      const updated = await manufacturingApi.updateRecipe(form.id, { ...form, version: 'v1' } as any)
      setRecipe(updated)
      setForm(updated)
      setEditing(false)
      toast({ title: 'Recipe saved' })
    } catch (e:any) {
      toast({ variant: 'destructive', title: e?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipe #{recipe?.id || recipeId}</h1>
          <p className="text-muted-foreground">Details</p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button onClick={() => setEditing(true)} disabled={!recipe}>Edit</Button>
          )}
          {editing && (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); setForm(recipe) }}>Cancel</Button>
              <Button onClick={onSave} disabled={!isValid || saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Name</div>
            {editing ? (
              <Input value={form?.name || ''} onChange={e => onChange('name', e.target.value)} />
            ) : (
              <div className="font-medium">{recipe?.name || (loading ? 'Loading...' : '-')}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Output Product (ID)</div>
            <div className="font-medium">{recipe?.productId ?? '-'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Output Quantity</div>
            {editing ? (
              <Input type="number" value={form?.outputQuantity ?? 0} onChange={e => onChange('outputQuantity', Number(e.target.value))} />
            ) : (
              <div className="font-medium">{recipe?.outputQuantity ?? '-'}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Yield (0-1)</div>
            {editing ? (
              <Input type="number" step="0.0001" value={form?.yield ?? 1} onChange={e => onChange('yield', Number(e.target.value))} />
            ) : (
              <div className="font-medium">{recipe?.yield ?? '-'}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Labor Cost</div>
            {editing ? (
              <Input type="number" step="0.01" value={form?.laborCost ?? 0} onChange={e => onChange('laborCost', Number(e.target.value))} />
            ) : (
              <div className="font-medium">{recipe?.laborCost ?? '-'}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Overhead Cost</div>
            {editing ? (
              <Input type="number" step="0.01" value={form?.overheadCost ?? 0} onChange={e => onChange('overheadCost', Number(e.target.value))} />
            ) : (
              <div className="font-medium">{recipe?.overheadCost ?? '-'}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Estimated Cost</div>
            <div className="font-medium">{form?.estimatedCost ?? recipe?.estimatedCost ?? '-'}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Loss %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recipe?.items || []).map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{it.productId}</TableCell>
                    <TableCell>{it.quantity}</TableCell>
                    <TableCell>{it.uom}</TableCell>
                    <TableCell>{it.lossPercent}</TableCell>
                  </TableRow>
                ))}
                {!loading && (!recipe || (recipe.items || []).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center">No items</TableCell>
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
