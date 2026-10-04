import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '../components/home'
import { metadataFor } from '../lib/route-metadata'
export const Route = createFileRoute('/')({ head: () => metadataFor('/'), component: HomePage })
