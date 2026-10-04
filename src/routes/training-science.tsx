import { createFileRoute, redirect } from '@tanstack/react-router'
export const Route = createFileRoute('/training-science')({ beforeLoad: () => { throw redirect({ to: '/learn/workout-science' }) } })
