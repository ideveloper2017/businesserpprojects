import {useEffect, useMemo, useState} from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { manufacturingApi, IssueItemDto, OutputItemDto, ProductionOrderDto } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

export default function OrderDetailPage() {
  const { id } = useParams()
  const orderId = useMemo(() => Number(id), [id])
  const [order, setOrder] = useState<ProductionOrderDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [issueItems, setIssueItems] = useState<IssueItemDto[]>([{ productId: 0, quantity: 0 }])
  const [outputItems, setOutputItems] = useState<OutputItemDto[]>([{ productId: 0, quantity: 0 }])
  const { toast } = useToast()

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

  useEffect(() => { load() }, [orderId])

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

      <Card>
        <CardHeader>
          <CardTitle>Issue Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border">
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
                      <Input type="number" value={row.productId || ''} onChange={e => {
                        const v = Number(e.target.value); setIssueItems(items => items.map((it,i) => i===idx?{...it, productId: v}:it))
                      }} />
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
          <div className="flex gap-2">
            <Button variant="ghost" onClick={addIssueRow}>Add row</Button>
            <Button onClick={submitIssue}>Issue</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receive Output</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border">
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
                      <Input type="number" value={row.productId || ''} onChange={e => {
                        const v = Number(e.target.value); setOutputItems(items => items.map((it,i) => i===idx?{...it, productId: v}:it))
                      }} />
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
          <div className="flex gap-2">
            <Button variant="ghost" onClick={addOutputRow}>Add row</Button>
            <Button onClick={submitOutput}>Receive</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
