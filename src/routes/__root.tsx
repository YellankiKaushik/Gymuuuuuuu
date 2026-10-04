import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { AppShell } from '../components/app-shell/shell'
import { PreferenceProvider } from '../components/app-shell/preferences'
import css from '../styles/app.css?url'
import { appConfig } from '../config/app'

const themeInit = `(function(){try{var p=JSON.parse(localStorage.getItem('fitness-os:preferences:v1')||'{}');var t=p.theme;if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`
export const Route = createRootRoute({
  head: () => ({ meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: `Home | ${appConfig.name}` }, { name: 'description', content: appConfig.description }], links: [{ rel: 'stylesheet', href: css }, { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' }] }),
  component: RootComponent,
})
function RootComponent() {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeInit }} /><HeadContent /></head><body><PreferenceProvider><AppShell><Outlet /></AppShell></PreferenceProvider><Scripts /></body></html>
}
