const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.tsx')) results.push(file);
          next();
        }
      });
    })();
  });
};

walk('./src', (err, results) => {
  if (err) throw err;
  let modifiedCount = 0;
  results.forEach(file => {
    let original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Replace backgrounds
    content = content.replace(/bg-white dark:bg-\[\#121212\]/g, 'bg-gray-900');
    content = content.replace(/bg-white dark:bg-black/g, 'bg-gray-900');
    content = content.replace(/bg-gray-50 dark:bg-\[\#1A1A1A\]/g, 'bg-black');
    content = content.replace(/bg-gray-50 dark:bg-\[\#121212\]/g, 'bg-black');
    content = content.replace(/bg-gray-100 dark:bg-gray-900/g, 'bg-gray-900');
    content = content.replace(/bg-white\/90 dark:bg-black\/90/g, 'bg-black/90');
    content = content.replace(/bg-white\/80 dark:bg-black\/80/g, 'bg-black/80');
    
    // Specific elements
    content = content.replace(/bg-white dark:bg-[#121212]/g, 'bg-gray-900');
    content = content.replace(/bg-gray-50 dark:hover:bg-gray-800/g, 'bg-gray-800 hover:bg-gray-700');
    
    // Replace borders to gold
    content = content.replace(/border-gray-200 dark:border-gray-800/g, 'border-[var(--color-primary)] border-opacity-30');
    content = content.replace(/border-gray-100 dark:border-gray-800/g, 'border-[var(--color-primary)] border-opacity-30');
    content = content.replace(/border-gray-300 dark:border-gray-700/g, 'border-[var(--color-primary)] border-opacity-50');
    
    // Replace text colors to fix contrast
    content = content.replace(/text-gray-900 dark:text-white/g, 'text-white');
    content = content.replace(/text-gray-800 dark:text-white/g, 'text-gray-100');
    content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-gray-300');
    content = content.replace(/text-gray-600 dark:text-gray-400/g, 'text-gray-400');
    
    // Any leftover bg-white that needs changing
    content = content.replace(/className="bg-white/g, 'className="bg-gray-900');
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      modifiedCount++;
      console.log(`Updated: ${file}`);
    }
  });
  console.log(`\nModified ${modifiedCount} files to apply Royal theme.`);
});
