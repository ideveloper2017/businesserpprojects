import {useEffect, useMemo, useState} from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { manufacturingApi, productApi, IssueItemDto, OutputItemDto, ProductionOrderDto } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function OrderDetailPage() {
  const { id } = useParams()
  const orderId = useMemo(() => Number(id), [id])
  const [order, setOrder] = useState<ProductionOrderDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [issueItems, setIssueItems] = useState<IssueItemDto[]>([{ productId: 0, quantity: 0 }])
  const [outputItems, setOutputItems] = useState<OutputItemDto[]>([{ productId: 0, quantity: 0 }])
  const { toast } = useToast()
  const [issueOpen, setIssueOpen] = useState(false)
  const [outputOpen, setOutputOpen] = useState(false)
  const [rawMaterials, setRawMaterials] = useState<any[]>([])
  const [finishedGoods, setFinishedGoods] = useState<any[]>([])

  const load = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const data = await manufacturingApi.getOrder(orderId)
      setOrder(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!orderId) return
    load()
  }, [orderId])

  useEffect(() => {
    let mounted = true
    productApi.getByType('RAW_MATERIAL', 500).then(list => { if (mounted) setRawMaterials(list) })
    productApi.getByType('FINISHED_GOOD', 200).then(list => { if (mounted) setFinishedGoods(list) })
    return () => { mounted = false }
  }, [])

  // Preload issue items from recipe when dialog is opened
  useEffect(() => {
    const preload = async () => {
      if (!issueOpen) return
      if (!order?.recipeId) return
      try {
        const r = await manufacturingApi.getRecipe(order.recipeId)
        const mapped: IssueItemDto[] = (r.items || []).map(it => ({ productId: it.productId, quantity: Number(it.quantity) }))
        if (mapped.length > 0) setIssueItems(mapped)
      } catch (e) {
        // ignore
      }
    }
    preload()
  }, [issueOpen, order?.recipeId])

  // Preload output items from recipe when dialog is opened
  useEffect(() => {
    const preload = async () => {
      if (!outputOpen) return
      if (!order?.recipeId) return
      try {
        const r = await manufacturingApi.getRecipe(order.recipeId)
        const productId = r.productId
        const qty = Number(order?.plannedQuantity || 0)
        if (productId) setOutputItems([{ productId, quantity: qty }])
      } catch (e) {
        // ignore
      }
    }
    preload()
  }, [outputOpen, order?.recipeId, order?.plannedQuantity])

  const changeStatus = async (status: string) => {
    if (!orderId) return
    setStatusLoading(true)
    try {
      const updated = await manufacturingApi.changeOrderStatus(orderId, status)
      setOrder(updated)
      toast({ title: `Status changed to ${status}` })
    } finally {
      setStatusLoading(false)
    }
  }

  const addIssueRow = () => setIssueItems(prev => [...prev, { productId: 0, quantity: 0 }])
  const addOutputRow = () => setOutputItems(prev => [...prev, { productId: 0, quantity: 0 }])

  const submitIssue = async () => {
    if (!orderId) return
    const items = issueItems.filter(i => i.productId && i.quantity)
    if (items.length === 0) {
      toast({ variant: 'destructive', title: 'Add at least one valid issue item' })
      return
    }
    try {
      await manufacturingApi.issueMaterials(orderId, { items })
      toast({ title: 'Materials issued' })
      setIssueItems([{ productId: 0, quantity: 0 }])
      await load()
    } catch {
      toast({ variant: 'destructive', title: 'Issue failed' })
    }
  }

  const submitOutput = async () => {
    if (!orderId) return
    const items = outputItems.filter(i => i.productId && i.quantity)
    if (items.length === 0) {
      toast({ variant: 'destructive', title: 'Add at least one valid output item' })
      return
    }
    try {
      await manufacturingApi.receiveOutput(orderId, { items })
      toast({ title: 'Output received' })
      setOutputItems([{ productId: 0, quantity: 0 }])
      await load()
    } catch {
      toast({ variant: 'destructive', title: 'Receive failed' })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order?.id}</h1>
          <p className="text-muted-foreground">Status: {order?.status}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={statusLoading} onClick={() => changeStatus('RELEASED')}>Release</Button>
          <Button variant="outline" disabled={statusLoading} onClick={() => changeStatus('IN_PROGRESS')}>Start</Button>
          <Button variant="outline" disabled={statusLoading} onClick={() => changeStatus('COMPLETED')}>Complete</Button>
          <Button variant="outline" disabled={statusLoading} onClick={() => changeStatus('CLOSED')}>Close</Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Issue Materials</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Issue Materials</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Enter raw materials to consume. Qty is in stock UOM. Batch and expiry are optional.</p>
            <div className="rounded-md border mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueItems.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select value={row.productId ? String(row.productId) : ''} onValueChange={(v) => {
                        const val = Number(v); setIssueItems(items => items.map((it,i) => i===idx?{...it, productId: val}:it))
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
                        <Input type="number" value={row.quantity || ''} onChange={e => {
                          const v = Number(e.target.value); setIssueItems(items => items.map((it,i) => i===idx?{...it, quantity: v}:it))
                        }} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.batchNumber ?? ''} onChange={e => setIssueItems(items => items.map((it,i)=> i===idx?{...it, batchNumber: e.target.value}:it))} />
                      </TableCell>
                      <TableCell>
                        <Input type="date" value={row.expiryDate ?? ''} onChange={e => setIssueItems(items => items.map((it,i)=> i===idx?{...it, expiryDate: e.target.value}:it))} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" onClick={addIssueRow}>Add row</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
              <Button onClick={async () => { await submitIssue(); setIssueOpen(false) }}>Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={outputOpen} onOpenChange={setOutputOpen}>
          <DialogTrigger asChild>
            <Button>Receive Output</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Receive Output</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Enter finished goods produced. Provide batch and expiry if applicable.</p>
            <div className="rounded-md border mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outputItems.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select value={row.productId ? String(row.productId) : ''} onValueChange={(v) => {
                        const val = Number(v); setOutputItems(items => items.map((it,i) => i===idx?{...it, productId: val}:it))
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select finished good" />
                        </SelectTrigger>
                        <SelectContent>
                          {finishedGoods.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name || p.sku || `#${p.id}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={row.quantity || ''} onChange={e => {
                          const v = Number(e.target.value); setOutputItems(items => items.map((it,i) => i===idx?{...it, quantity: v}:it))
                        }} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.batchNumber ?? ''} onChange={e => setOutputItems(items => items.map((it,i)=> i===idx?{...it, batchNumber: e.target.value}:it))} />
                      </TableCell>
                      <TableCell>
                        <Input type="date" value={row.expiryDate ?? ''} onChange={e => setOutputItems(items => items.map((it,i)=> i===idx?{...it, expiryDate: e.target.value}:it))} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" onClick={addOutputRow}>Add row</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOutputOpen(false)}>Cancel</Button>
              <Button onClick={async () => { await submitOutput(); setOutputOpen(false) }}>Receive</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
