import { contents } from '../data/contents'
import type { ContentItem, ContentTarget, ContentType } from '../types/content'

export type TargetFilter = 'Semua' | Exclude<ContentTarget, 'Umum'>
export type TypeFilter = 'Semua' | ContentType

export function findContentBySlug(slug: string): ContentItem | undefined {
  return contents.find((item) => item.slug === slug)
}

export function filterContents(options: { query: string; target: TargetFilter; type: TypeFilter }): ContentItem[] {
  const keyword = options.query.trim().toLowerCase()
  return contents.filter((item) => {
    if (keyword && !item.title.toLowerCase().includes(keyword)) return false
    if (options.target !== 'Semua' && item.target !== options.target) return false
    if (options.type !== 'Semua' && item.type !== options.type) return false
    return true
  })
}

export function contentsForProgram(target: Exclude<ContentTarget, 'Umum'>): ContentItem[] {
  return contents.filter((item) => item.target === target && (item.type === 'Meal Plan' || item.type === 'Workout'))
}
