import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '../features/settings/page'
export const Route = createFileRoute('/settings')({ head: () => ({ meta: [{ title: 'Settings — Fitness OS' }] }), component: SettingsPage })
