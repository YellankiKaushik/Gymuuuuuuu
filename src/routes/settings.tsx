import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '../features/settings/page'
export const Route = createFileRoute('/settings')({ head: () => metadataFor('/settings'), component: SettingsPage })
