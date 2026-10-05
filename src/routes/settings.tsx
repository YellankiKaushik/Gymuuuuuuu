import { metadataFor } from '../lib/route-metadata'
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { SettingsPage } from '../features/settings/page'
export const Route = createFileRoute('/settings')({ head: () => metadataFor('/settings'), component: SettingsRoute })
function SettingsRoute() { const { pathname } = useLocation(); return <>{pathname === '/settings' && <SettingsPage />}<Outlet /></> }
