import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ChevronRight, CircleHelp, Dumbbell, Grid2X2, Leaf, LockKeyhole, Menu, Moon, Search, Settings2, ShieldCheck, SlidersHorizontal, Sprout, Sun, Target, TrendingUp, X } from 'lucide-react'
const icons = { home: Grid2X2, book: BookOpen, dumbbell: Dumbbell, leaf: Leaf, moon: Moon, chart: TrendingUp, tools: SlidersHorizontal, bookmark: Bookmark, arrow: ArrowRight, external: ArrowUpRight, check: Check, chevron: ChevronRight, down: ChevronDown, help: CircleHelp, lock: LockKeyhole, menu: Menu, search: Search, settings: Settings2, shield: ShieldCheck, sprout: Sprout, sun: Sun, target: Target, close: X, download: ArrowDownToLine }
export type IconName = keyof typeof icons
export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const Component = icons[name]
  return <Component size={size} strokeWidth={1.65} aria-hidden="true" className={className} />
}
