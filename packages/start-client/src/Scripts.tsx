import { useRouter, useRouterState, warning } from '@tanstack/react-router'
import { Asset } from './Asset'
import type { RouterManagedTag } from '@tanstack/react-router'

type RouterManagedScript = RouterManagedTag & { key: string }
export const Scripts = () => {
  const router = useRouter()

  const assetScripts = useRouterState({
    select: (state) => {
      const assetScripts: Array<RouterManagedScript> = []
      const manifest = router.ssr?.manifest

      if (!manifest) {
        warning(false, '<Scripts /> found no manifest')
        return []
      }

      state.matches
        .map((match) => router.looseRoutesById[match.routeId]!)
        .forEach((route) =>
          manifest.routes[route.id]?.assets
            ?.filter((d) => d.tag === 'script')
            .forEach((asset) => {
              assetScripts.push({
                tag: 'script',
                attrs: asset.attrs,
                children: asset.children,
                key: `${route.id}-${asset.attrs?.src || asset.children}`,
              })
            }),
        )

      return assetScripts
    },
    structuralSharing: true as any,
  })

  const { scripts } = useRouterState({
    select: (state) => ({
      scripts: (
        state.matches
          .map((match) => match.scripts!)
          .flat(1)
          .filter(Boolean) as Array<RouterManagedTag>
      ).map(({ children, ...script }) => {
        const managedScript: RouterManagedScript = {
          tag: 'script',
          attrs: {
            ...script,
            suppressHydrationWarning: true,
          },
          children,
          key: script.attrs?.src || (script as any).children || '',
        }
        return managedScript
      }),
    }),
  })

  const allScripts = [...scripts, ...assetScripts]

  return (
    <>
      {allScripts.map((asset) => (
        <Asset {...asset} key={asset.key} />
      ))}
    </>
  )
}
