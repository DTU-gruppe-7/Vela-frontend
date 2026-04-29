import { createElement } from 'react';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { createServer as createViteServer } from 'vite';
import SsrApp from '../src/ssr/SsrApp';
import { isSsrRoute } from '../src/ssr/routes';
import type { SsrInitialData } from '../src/types/ssr';
import { resolveSsrInitialData, shouldRedirectForAuth } from './ssrData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 3000);

function serializeInitialData(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

async function readTemplate(vite: Awaited<ReturnType<typeof createViteServer>> | null): Promise<string> {
    const templatePath = isProduction ? path.resolve(root, 'dist/index.html') : path.resolve(root, 'index.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    if (vite) {
        return vite.transformIndexHtml('/', template);
    }

    return template;
}

async function renderPage(url: string, template: string, initialData: SsrInitialData): Promise<string> {
    const appHtml = renderToString(
        createElement(
            StaticRouter,
            { location: url },
            createElement(SsrApp, { initialData }),
        ),
    );

    return template
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace('</body>', `<script>window.__INITIAL_DATA__ = ${serializeInitialData(initialData)};</script></body>`);
}

async function createServer() {
    const app = express();
    const vite = isProduction
        ? null
        : await createViteServer({
              server: { middlewareMode: true },
              appType: 'custom',
          });

    if (vite) {
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.resolve(root, 'dist')));
    }

    app.use(async (req, res, next) => {
        const url = req.originalUrl;
        const pathname = new URL(url, `http://${req.headers.host ?? 'localhost'}`).pathname;

        if (!isSsrRoute(pathname)) {
            if (isProduction) {
                res.sendFile(path.resolve(root, 'dist/index.html'));
                return;
            }

            next();
            return;
        }

        try {
            const context = {
                cookieHeader: req.headers.cookie,
                authorizationHeader: req.headers.authorization,
            };

            if (await shouldRedirectForAuth(pathname, context)) {
                res.redirect(302, '/');
                return;
            }

            const template = await readTemplate(vite);
            const initialData = await resolveSsrInitialData(pathname, context);
            const html = await renderPage(url, template, initialData);

            res.status(200).setHeader('Content-Type', 'text/html').end(html);
        } catch (error) {
            if (vite) {
                vite.ssrFixStacktrace(error as Error);
            }

            next(error);
        }
    });

    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`SSR server running at http://localhost:${port}`);
    });
}

void createServer();