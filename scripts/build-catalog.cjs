const fs = require('fs');
const path = require('path');

const datasetDir = path.join(__dirname, '..', 'dataset');
const outputDir = path.join(__dirname, '..', 'public');
const publicDatasetDir = path.join(outputDir, 'dataset');
const outputFile = path.join(outputDir, 'dataset-manifest.json');

const subjectTitles = {
  history: 'History (India and the Contemporary World II)',
  political_science: 'Political Science (Democratic Politics II)',
  economics: 'Economics (Understanding Economic Development)',
  geography: 'Geography (Contemporary India II)',
  english: 'English First Flight & Footprints'
};

const chapterTitles = {
  class_10: {
    history: {
      chapter_1: 'Chapter 1: The Rise of Nationalism in Europe',
      chapter_2: 'Chapter 2: Nationalism in India',
      chapter_3: 'Chapter 3: The Making of a Global World',
      chapter_5: 'Chapter 5: Print Culture and the Modern World',
      chapter_6: 'Chapter 6: Work, Life and Leisure',
      chapter_7: 'Chapter 7: Novels, Society and History',
      chapter_8: 'Chapter 8: The Age of Industrialisation'
    },
    political_science: {
      chapter_1: 'Chapter 1: Power Sharing',
      chapter_2: 'Chapter 2: Federalism',
      chapter_3: 'Chapter 3: Democracy and Diversity',
      chapter_4: 'Chapter 4: Gender, Religion and Caste',
      chapter_6: 'Chapter 6: Political Parties'
    }
  }
};

const manifest = {
  generatedAt: new Date().toISOString(),
  classes: {},
  allWordsIndex: [] // Lightweight index for global search: { word, meaning, classId, subjectId, chapterId, pageNo, difficulty }
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy directory recursively to ensure dist/ contains all public/dataset files for production hosting
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying dataset files to public/dataset for production bundling...');
copyDirRecursive(datasetDir, publicDatasetDir);

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.json') && entry.name.startsWith('chapter_')) {
      const relPath = path.relative(datasetDir, fullPath).replace(/\\/g, '/');
      const [classId, subjectId, chapterFileName] = relPath.split('/');
      const chapterId = chapterFileName.replace('.json', '');

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        if (!Array.isArray(data)) continue;

        let totalWordsInChapter = 0;
        const pageInfos = [];

        data.forEach(page => {
          const pageNo = page.page_no;
          const words = page.words || [];
          totalWordsInChapter += words.length;

          pageInfos.push({
            pageNo: pageNo,
            wordCount: words.length
          });

          // Add words to light index
          words.forEach(w => {
            manifest.allWordsIndex.push({
              id: w.id,
              word: w.word,
              meaning: w.meaning || '',
              hindi_meaning: w.hindi_meaning || '',
              difficulty: w.difficulty || 'Medium',
              classId,
              subjectId,
              chapterId,
              pageNo
            });
          });
        });

        if (!manifest.classes[classId]) {
          manifest.classes[classId] = {
            id: classId,
            name: `Class ${classId.replace('class_', '')}`,
            subjects: {}
          };
        }

        if (!manifest.classes[classId].subjects[subjectId]) {
          manifest.classes[classId].subjects[subjectId] = {
            id: subjectId,
            name: subjectTitles[subjectId] || subjectId.replace(/_/g, ' ').toUpperCase(),
            chapters: {}
          };
        }

        const formattedTitle = chapterTitles[classId]?.[subjectId]?.[chapterId] || 
          `Chapter ${chapterId.replace('chapter_', '')}`;

        manifest.classes[classId].subjects[subjectId].chapters[chapterId] = {
          id: chapterId,
          title: formattedTitle,
          file: relPath,
          pageCount: pageInfos.length,
          wordCount: totalWordsInChapter,
          pages: pageInfos
        };
      } catch (err) {
        console.error(`Error parsing ${relPath}:`, err.message);
      }
    }
  }
}

scanDir(datasetDir);

// Add empty metadata entries for Class 6 to 12 if not present to enable UI switching
const allClasses = ['class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'];
allClasses.forEach(cId => {
  if (!manifest.classes[cId]) {
    manifest.classes[cId] = {
      id: cId,
      name: `Class ${cId.replace('class_', '')}`,
      subjects: {
        english: {
          id: 'english',
          name: subjectTitles.english,
          chapters: {}
        },
        history: {
          id: 'history',
          name: subjectTitles.history,
          chapters: {}
        }
      }
    };
  }
});

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`✅ Dataset Manifest built successfully at ${outputFile}!`);
console.log(`Indexed ${manifest.allWordsIndex.length} total words across dataset.`);
