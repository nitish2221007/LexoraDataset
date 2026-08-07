const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'public', 'dataset-manifest.json');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Change this to your live domain when deployed (e.g., https://lexora.com)
const BASE_URL = 'https://lexora.vercel.app'; 

function generateSitemap() {
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest file not found. Run build-catalog first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const urls = [];

  // Home URL
  urls.push({
    loc: `${BASE_URL}/`,
    priority: '1.0',
    changefreq: 'daily'
  });

  // Generate deep URLs for every Class, Subject, Chapter, and Page
  Object.keys(manifest.classes).forEach((classId) => {
    const classNum = classId.replace('class_', '');
    const classObj = manifest.classes[classId];

    Object.keys(classObj.subjects || {}).forEach((subjId) => {
      const subjObj = classObj.subjects[subjId];

      Object.keys(subjObj.chapters || {}).forEach((chapId) => {
        const chapObj = subjObj.chapters[chapId];

        chapObj.pages.forEach((pg) => {
          urls.push({
            loc: `${BASE_URL}/?c=${classNum}&s=${subjId}&ch=${chapId}&p=${pg.pageNo}`,
            priority: '0.8',
            changefreq: 'weekly'
          });
        });
      });
    });
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(sitemapPath, xmlContent, 'utf-8');
  console.log(`✅ SEO Sitemap generated at ${sitemapPath} with ${urls.length} indexed URLs!`);
}

generateSitemap();
