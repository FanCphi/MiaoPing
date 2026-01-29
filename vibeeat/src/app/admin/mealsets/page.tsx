import { prisma } from '@/lib/prisma'
import { createRestaurant, createMealSet, updateMealSet, deleteMealSet } from '@/app/actions/mealset'
import Link from 'next/link'

export default async function AdminMealSetsPage() {
  const restaurants = await prisma.restaurant.findMany({
    include: { mealSets: true },
    orderBy: { id: 'asc' }
  })

  const allMealSets = await prisma.mealSet.findMany({
    include: { restaurant: true },
    orderBy: { id: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">商家套餐管理</h1>
          <Link href="/" className="text-indigo-600">返回首页</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">新增餐厅</h2>
            <form action={createRestaurant} className="space-y-3">
              <input name="name" placeholder="餐厅名称" className="w-full border rounded px-3 py-2" required />
              <input name="location" placeholder="餐厅地址" className="w-full border rounded px-3 py-2" required />
              <input name="image" placeholder="封面图片URL(可选)" className="w-full border rounded px-3 py-2" />
              <button className="w-full bg-indigo-600 text-white rounded px-3 py-2">创建餐厅</button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">新增套餐</h2>
            <form action={createMealSet} className="space-y-3">
              <select name="restaurantId" className="w-full border rounded px-3 py-2" required>
                <option value="">选择餐厅</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input name="title" placeholder="套餐标题" className="w-full border rounded px-3 py-2" required />
              <input name="price" type="number" step="0.01" placeholder="人均价格" className="w-full border rounded px-3 py-2" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="minPeople" type="number" placeholder="最少人数" className="w-full border rounded px-3 py-2" required />
                <input name="maxPeople" type="number" placeholder="最多人数" className="w-full border rounded px-3 py-2" required />
              </div>
              <textarea name="menuDetails" placeholder="菜单详情或亮点" rows={3} className="w-full border rounded px-3 py-2" />
              <button className="w-full bg-indigo-600 text-white rounded px-3 py-2">创建套餐</button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">套餐列表与编辑</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">餐厅</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allMealSets.map(set => (
                  <tr key={set.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">{set.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{set.restaurant.name}</td>
                    <td className="px-4 py-2">
                      <form action={updateMealSet} className="grid grid-cols-6 gap-2 items-center">
                        <input type="hidden" name="id" value={set.id} />
                        <input type="hidden" name="menuDetails" value={set.menuDetails || ''} />
                        <input name="title" defaultValue={set.title} className="col-span-2 border rounded px-2 py-1 text-sm" />
                        <input name="price" type="number" step="0.01" defaultValue={set.price} className="border rounded px-2 py-1 text-sm" />
                        <input name="minPeople" type="number" defaultValue={set.minPeople} className="border rounded px-2 py-1 text-sm" />
                        <input name="maxPeople" type="number" defaultValue={set.maxPeople} className="border rounded px-2 py-1 text-sm" />
                        <button className="bg-indigo-600 text-white rounded px-2 py-1 text-sm">保存</button>
                      </form>
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">编辑菜单详情</summary>
                        <form action={updateMealSet} className="mt-2">
                          <input type="hidden" name="id" value={set.id} />
                          <input type="hidden" name="title" value={set.title} />
                          <input type="hidden" name="price" value={set.price} />
                          <input type="hidden" name="minPeople" value={set.minPeople} />
                          <input type="hidden" name="maxPeople" value={set.maxPeople} />
                          <textarea name="menuDetails" defaultValue={set.menuDetails} rows={3} className="w-full border rounded px-2 py-1 text-sm" />
                          <div className="mt-2">
                            <button className="bg-indigo-600 text-white rounded px-2 py-1 text-sm">保存菜单详情</button>
                          </div>
                        </form>
                      </details>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">¥{set.price}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{set.minPeople}-{set.maxPeople}</td>
                    <td className="px-4 py-2">
                      <form action={deleteMealSet}>
                        <input type="hidden" name="id" value={set.id} />
                        <button className="bg-red-600 text-white rounded px-3 py-1 text-sm">删除</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
