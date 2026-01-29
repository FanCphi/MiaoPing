'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createRestaurant(formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const image = (formData.get('image') as string) || null

  if (!name || !location) {
    // return { error: '缺少餐厅名称或地址' }
    return
  }

  try {
    await prisma.restaurant.create({
      data: { name, location, image: image || undefined }
    })
    revalidatePath('/admin/mealsets')
    // return { success: true }
  } catch (e) {
    // return { error: '创建餐厅失败' }
  }
}

export async function createMealSet(formData: FormData) {
  const restaurantId = parseInt(formData.get('restaurantId') as string)
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const minPeople = parseInt(formData.get('minPeople') as string)
  const maxPeople = parseInt(formData.get('maxPeople') as string)
  const menuDetails = formData.get('menuDetails') as string

  if (!restaurantId || !title || isNaN(price) || isNaN(minPeople) || isNaN(maxPeople)) {
    // return { error: '参数不完整或格式错误' }
    return
  }
  if (minPeople <= 0 || maxPeople <= 0 || minPeople > maxPeople) {
    // return { error: '人数区间不合法' }
    return
  }

  try {
    await prisma.mealSet.create({
      data: {
        restaurantId,
        title,
        price,
        minPeople,
        maxPeople,
        menuDetails
      }
    })
    revalidatePath('/admin/mealsets')
    // return { success: true }
  } catch (e) {
    // return { error: '创建套餐失败' }
  }
}

export async function updateMealSet(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const minPeople = parseInt(formData.get('minPeople') as string)
  const maxPeople = parseInt(formData.get('maxPeople') as string)
  const menuDetails = formData.get('menuDetails') as string

  if (!id || !title || isNaN(price) || isNaN(minPeople) || isNaN(maxPeople)) {
    // return { error: '参数不完整或格式错误' }
    return
  }
  if (minPeople <= 0 || maxPeople <= 0 || minPeople > maxPeople) {
    // return { error: '人数区间不合法' }
    return
  }

  try {
    await prisma.mealSet.update({
      where: { id },
      data: {
        title,
        price,
        minPeople,
        maxPeople,
        menuDetails
      }
    })
    revalidatePath('/admin/mealsets')
    // return { success: true }
  } catch (e) {
    // return { error: '更新套餐失败' }
  }
}

export async function deleteMealSet(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  if (!id) return // { error: '缺少套餐ID' }

  try {
    await prisma.mealSet.delete({ where: { id } })
    revalidatePath('/admin/mealsets')
    // return { success: true }
  } catch (e) {
    // return { error: '删除失败' }
  }
}
