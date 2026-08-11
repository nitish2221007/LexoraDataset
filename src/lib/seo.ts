/**
 * SEO Utility for NCERT Unofficial Vocab - Laser-Focused on Class 10 History & Political Science
 * Dynamic title, meta tags, canonical link, and JSON-LD structured data generator
 */

export interface SEOConfig {
  classNum: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  pageNo: number;
  wordCount?: number;
  domain?: string;
}

const DEFAULT_DOMAIN = 'https://ncert-unofficial-vocab.vercel.app';

export function getSEOPermutations(config: SEOConfig) {
  const { classNum, subjectId, subjectName, chapterId, chapterTitle, pageNo, domain = DEFAULT_DOMAIN } = config;
  
  const chapNum = chapterId.replace('chapter_', '');
  const cleanSubject = subjectName.split('(')[0].trim(); // "History" or "Political Science"
  const cleanChapTitle = chapterTitle.replace(/^Chapter\s+\d+:\s*/i, '').trim();

  // Primary Class 10 Search Query Permutations:
  // "class 10 ncert vocab ch 1 history"
  // "ncert ch 2 history class 10 vocab"
  // "class 10 history ncert vocab ch 1"
  // "class 10 political science ncert vocab ch 1"
  const perm1 = `class ${classNum} ncert vocab ch ${chapNum} ${cleanSubject.toLowerCase()}`;
  const perm2 = `ncert ch ${chapNum} ${cleanSubject.toLowerCase()} class ${classNum} vocab`;
  const perm3 = `class ${classNum} ${cleanSubject.toLowerCase()} ncert vocab ch ${chapNum}`;
  const perm4 = `ncert class ${classNum} ${cleanSubject.toLowerCase()} chapter ${chapNum} word meaning`;
  const perm5 = `class ${classNum} ${cleanSubject.toLowerCase()} ch ${chapNum} hard words`;

  // Dynamic Title focusing strictly on Class 10 History and Political Science query patterns
  const title = `Class ${classNum} NCERT Vocab Ch ${chapNum} ${cleanSubject} | Class ${classNum} ${cleanSubject} NCERT Vocab Ch ${chapNum} Page ${pageNo} | NCERT Unofficial Vocab`;

  // Meta Description with rich search intent
  const description = `${perm1.toUpperCase()} & ${perm2.toUpperCase()}: Free NCERT Class ${classNum} ${cleanSubject} Chapter ${chapNum} (${cleanChapTitle}) Page ${pageNo} word meanings with pronunciations, Hindi meanings (हिंदी अर्थ), flashcards & quiz. 12,441 Class 10 words indexed.`;

  // Comprehensive Meta Keywords List focused laser-sharp on Class 10 History & Political Science
  const keywords = [
    perm1,
    perm2,
    perm3,
    perm4,
    perm5,
    `class 10 ncert vocab ch 1 history`,
    `class 10 history ncert vocab ch 1`,
    `ncert ch 2 history class 10 vocab`,
    `class 10 history ncert vocab ch 2`,
    `class 10 history ncert vocab ch 3`,
    `class 10 history ncert vocab ch 5`,
    `class 10 history ncert vocab ch 6`,
    `class 10 history ncert vocab ch 7`,
    `class 10 history ncert vocab ch 8`,
    `class 10 political science ncert vocab ch 1`,
    `class 10 political science ncert vocab ch 2`,
    `class 10 political science ncert vocab ch 3`,
    `class 10 political science ncert vocab ch 4`,
    `class 10 political science ncert vocab ch 6`,
    `ncert class 10 history chapter ${chapNum} page ${pageNo} word meaning`,
    `class 10 history chapter ${chapNum} word meaning in hindi`,
    `class 10 political science chapter ${chapNum} word meaning in hindi`,
    `class 10 history ch ${chapNum} hard words`,
    `ncert class 10 history word meaning page wise`,
    `ncert class 10 political science word meaning page wise`,
    `ncert unofficial vocab class 10`
  ].join(', ');

  const canonicalUrl = `${domain}/?c=${classNum}&s=${subjectId}&ch=${chapterId}&p=${pageNo}`;

  // Structured Data Schemas
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": domain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `Class ${classNum}`,
        "item": `${domain}/?c=${classNum}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cleanSubject,
        "item": `${domain}/?c=${classNum}&s=${subjectId}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `Chapter ${chapNum}`,
        "item": `${domain}/?c=${classNum}&s=${subjectId}&ch=${chapterId}`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": `Page ${pageNo}`,
        "item": canonicalUrl
      }
    ]
  };

  const educationalResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": title,
    "description": description,
    "educationalLevel": `Class ${classNum}`,
    "learningResourceType": "Class 10 NCERT Vocabulary Glossary & Flashcards",
    "isAccessibleForFree": true,
    "inLanguage": ["en", "hi"],
    "provider": {
      "@type": "Organization",
      "name": "NCERT Unofficial Vocab",
      "url": domain
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I find Class 10 NCERT Vocab Ch ${chapNum} ${cleanSubject} page by page?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can explore page-wise word meanings, audio pronunciations, Hindi translations, and flashcards for Class 10 NCERT ${cleanSubject} Chapter ${chapNum} (${cleanChapTitle}) on NCERT Unofficial Vocab.`
        }
      },
      {
        "@type": "Question",
        "name": `What word meanings are included in Class 10 ${cleanSubject} NCERT Vocab Ch ${chapNum} Page ${pageNo}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Page ${pageNo} of Class 10 NCERT ${cleanSubject} Chapter ${chapNum} covers essential textbook vocabulary with Hindi meanings, pronunciations, funny memory notes, and quizzes.`
        }
      }
    ]
  };

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    schemas: [breadcrumbSchema, educationalResourceSchema, faqSchema]
  };
}

export function applySEO(config: SEOConfig) {
  const { title, description, keywords, canonicalUrl, schemas } = getSEOPermutations(config);

  // 1. Update Title
  document.title = title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Update Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', keywords);

  // 4. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 5. OpenGraph Tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', canonicalUrl);

  // 6. Twitter Tags
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', title);

  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', description);

  // 7. Inject/Update Structured Data Schemas
  let scriptTag = document.getElementById('json-ld-schema');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'json-ld-schema';
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schemas);
}
