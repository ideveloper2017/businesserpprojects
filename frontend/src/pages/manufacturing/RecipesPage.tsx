import {useEffect, useState} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { manufacturingApi, RecipeDto } from '@/lib/api'

export default function RecipesPage() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<RecipeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading ? [] : filtered).map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.productId}</TableCell>
                    <TableCell>{r.outputQuantity}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/manufacturing/recipes/${r.id}`)}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No recipes</TableCell>
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
