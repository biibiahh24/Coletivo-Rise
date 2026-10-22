import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);

test("declares the database and private file bindings", async () => {
  const manifest = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(manifest.d1, "DB");
  assert.equal(manifest.r2, "BUCKET");
});

test("keeps administrative exports and submissions on server routes", async () => {
  const submissionRoute = await readFile(new URL("app/api/submissions/route.ts", root), "utf8");
  const exportRoute = await readFile(new URL("app/api/admin/export/route.ts", root), "utf8");
  const demoExportRoute = await readFile(new URL("app/api/admin/demo-export/route.ts", root), "utf8");
  const adminPage = await readFile(new URL("app/admin/page.tsx", root), "utf8");

  assert.match(submissionRoute, /camp_registrations/);
  assert.match(submissionRoute, /TURNSTILE_SECRET_KEY/);
  assert.match(exportRoute, /getAdminForRequest/);
  assert.match(exportRoute, /createSupabaseAdminClient/);
  assert.match(exportRoute, /text\/csv/);
  assert.match(demoExportRoute, /process\.env\.NODE_ENV !== "production"/);
  assert.match(demoExportRoute, /Content-Disposition/);
  assert.match(adminPage, /getAdminForRequest/);
  assert.match(adminPage, /redirect\("\/admin\/login\?next=\/admin"\)/);
  assert.match(adminPage, /Modo de demonstração local/);
  assert.match(adminPage, /process\.env\.NODE_ENV !== "production"/);
  assert.match(adminPage, /\/api\/admin\/demo-export/);
});

test("provides a Supabase-backed administrative login", async () => {
  const loginPage = await readFile(new URL("app/admin/login/page.tsx", root), "utf8");
  const loginRoute = await readFile(new URL("app/api/admin/login/route.ts", root), "utf8");
  const proxy = await readFile(new URL("proxy.ts", root), "utf8");

  assert.match(loginPage, /LoginForm/);
  assert.match(loginRoute, /signInWithPassword/);
  assert.match(loginRoute, /admin_users/);
  assert.match(proxy, /getClaims/);
});

test("links the registration page to the protected admin area", async () => {
  const siteChrome = await readFile(new URL("app/components/site-chrome.tsx", root), "utf8");
  assert.match(siteChrome, /href="\/admin"/);
  assert.match(siteChrome, /pathname === "\/inscricao"/);
  assert.match(siteChrome, /Área administrativa/);
});

test("presents the shirt photos as one first edition", async () => {
  const storePage = await readFile(new URL("app/loja/page.tsx", root), "utf8");
  const editionCarousel = await readFile(new URL("app/components/edition-carousel.tsx", root), "utf8");
  const shirtOrder = await readFile(new URL("app/components/shirt-order.tsx", root), "utf8");
  assert.match(storePage, /Loja oficial Rise/);
  assert.match(storePage, /store-intro-visual/);
  assert.doesNotMatch(storePage, /<ProductGallery \/>/);
  assert.match(storePage, /Uma peça\. Uma mensagem\./);
  assert.match(storePage, /<EditionCarousel \/>/);
  assert.doesNotMatch(storePage, /Edição 02|Edição 03/);
  assert.match(editionCarousel, /aria-roledescription="carrossel"/);
  assert.match(editionCarousel, /Uma única camiseta/);
  assert.match(storePage, /camiseta-rise-editorial\.jpeg/);
  assert.match(editionCarousel, /camiseta-rise-detalhe\.jpeg/);
  assert.match(editionCarousel, /camiseta-rise-dupla\.jpeg/);
  assert.match(editionCarousel, /fit: "contain"/);
  assert.doesNotMatch(editionCarousel, /camiseta-rise-03\.jpeg/);
  assert.doesNotMatch(editionCarousel, /camiseta-rise-editorial\.jpeg/);
  assert.doesNotMatch(editionCarousel, /Edição 02|Edição 03/);
  assert.match(shirtOrder, /const edition = "Camiseta Rise — Edição 01"/);
  assert.doesNotMatch(shirtOrder, /Edição 02|Edição 03|Escolha uma edição/);
});

test("shows unique memories from previous camp editions", async () => {
  const campPage = await readFile(new URL("app/acampamento/page.tsx", root), "utf8");
  const campGallery = await readFile(new URL("app/components/camp-memory-gallery.tsx", root), "utf8");
  const images = [...campGallery.matchAll(/image: "([^"]+)"/g)].map((match) => match[1]);
  assert.match(campPage, /<CampMemoryGallery \/>/);
  assert.equal(images.length, 18);
  assert.equal(new Set(images).size, images.length);
  assert.match(campGallery, /campMemories\.length} momentos, nenhuma foto repetida/);
});

test("uses unique photos throughout the home page", async () => {
  const homePage = await readFile(new URL("app/page.tsx", root), "utf8");
  const rotatingHero = await readFile(new URL("app/components/rotating-hero.tsx", root), "utf8");
  const homePhotos = [...homePage.matchAll(/(?:image: |src=)[{]?"(\/assets\/inicio-rise-[^"]+)"/g)].map((match) => match[1]);
  const heroPhotos = [...rotatingHero.matchAll(/image: "(\/assets\/inicio-rise-[^"]+)"/g)].map((match) => match[1]);
  const photos = [...homePhotos, ...heroPhotos];
  assert.equal(photos.length, 9);
  assert.equal(new Set(photos).size, photos.length);
  assert.doesNotMatch(homePage, /encontro-rise-/);
  assert.doesNotMatch(rotatingHero, /encontro-rise-/);
});
