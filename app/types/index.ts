export type City = {
  id: number
  name: string
  slug: string
  region: string | null
  places_count: number
}

export type Category = {
  id: number
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export type Place = {
  id: number
  name: string
  slug: string
  city_id: number
  category_id: number
  address: string | null
  phone: string | null
  website: string | null
  telegram: string | null
  hours: Record<string, string> | null
  description: string | null
  photos: string[] | null
  is_online: boolean
  is_verified: boolean
  is_featured: boolean
  rating_avg: number
  rating_count: number
  created_at: string
  city?: City
  category?: Category
  reviews?: Review[]
}

export type Review = {
  id: number
  place_id: number
  author_name: string
  rating: number
  text: string | null
  created_at: string
}

export type OnlineService = {
  id: number
  name: string
  type: 'telegram' | 'shop' | 'community' | 'other'
  url: string | null
  description: string | null
  subscribers_count: number | null
  is_verified: boolean
  is_featured: boolean
}
