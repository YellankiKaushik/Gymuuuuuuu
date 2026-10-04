import { appConfig } from '../config/app'
import { findModule } from '../data/navigation'
export function metadataFor(path: string) {
  const module = findModule(path)
  return { meta: [{ title: `${module?.title ?? 'Home'} | ${appConfig.name}` }, { name: 'description', content: module?.description ?? appConfig.description }, ...(path.includes('$slug') ? [{ name: 'robots', content: 'noindex' }] : [])], links: path.includes('$slug') ? [] : [{ rel: 'canonical', href: new URL(path, appConfig.origin).href }] }
}
