import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ErrorState, LoadingState, NotFoundState } from './components/common/states'
export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true, defaultPreload: 'intent', defaultPendingComponent: LoadingState, defaultErrorComponent: ErrorState, defaultNotFoundComponent: NotFoundState })
}
declare module '@tanstack/react-router' { interface Register { router: ReturnType<typeof getRouter> } }
