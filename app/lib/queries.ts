import { supabase } from './supabase'
import type { Place, City, Category, OnlineService, Review } from '@/types'

export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getPlacesByCity(
  cityId: number,
  categorySlug?: string
): Promise<Place[]> {
  let query = supabase
    .from('places')
    .select('*, city:cities(name,slug), category:categories(name,slug,icon)')
    .eq('city_id', cityId)
    .eq('is_online', false)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTopPlaces(limit = 6): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, city:cities(name,slug), category:categories(name,slug,icon)')
    .eq('is_verified', true)
    .eq('is_online', false)
    .order('rating_avg', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getPlace(citySlug: string, placeSlug: string): Promise<Place | null> {
  const city = await getCityBySlug(citySlug)
  if (!city) return null

  const { data, error } = await supabase
    .from('places')
    .select('*, city:cities(name,slug), category:categories(name,slug,icon), reviews(*)')
    .eq('city_id', city.id)
    .eq('slug', placeSlug)
    .single()

  if (error) return null
  return data
}

export async function getOnlineServices(): Promise<OnlineService[]> {
  const { data, error } = await supabase
    .from('online_services')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('subscribers_count', { ascending: false })
  if (error) throw error
  return data
}

export async function addReview(
  placeId: number,
  review: { author_name: string; rating: number; text?: string }
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ place_id: placeId, ...review })
    .select()
    .single()
  if (error) throw error
  return data
}
