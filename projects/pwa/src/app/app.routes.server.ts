import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    { path: '', renderMode: RenderMode.Prerender },
    { path: 'home',renderMode: RenderMode.Prerender },
    { path: 'popular', renderMode: RenderMode.Prerender },
    { path: 'show-detail/:showId', renderMode: RenderMode.Client, },
    { path: 'search', renderMode: RenderMode.Prerender},
    { path: 'setting', renderMode: RenderMode.Prerender },
    { path: 'analytics', renderMode: RenderMode.Prerender },
    { path: 'about', renderMode: RenderMode.Prerender },
    {
        path: 'dropbox-redirect',
        renderMode: RenderMode.Prerender
    },
    {
        path: 'privacy-policy',
        renderMode: RenderMode.Prerender
    },
    {
        path: '**', // wildcard path for 404
        renderMode: RenderMode.Prerender,
    }
];
