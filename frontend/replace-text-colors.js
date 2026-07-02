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
    
    // Improve text visibility on dark background
    content = content.replace(/text-gray-500/g, 'text-gray-300');
    content = content.replace(/text-gray-400/g, 'text-gray-200');
    
    // Make sure all inputs/selects explicitly use text-white so they are visible
    content = content.replace(/className="([^"]*)bg-gray-900([^"]*)"/g, (match, p1, p2) => {
       if (match.includes('text-') || match.includes('text-white')) return match;
       return `className="${p1}bg-gray-900 text-white${p2}"`;
    });
    
    // specifically target dark:bg-gray-900 inputs 
    content = content.replace(/dark:bg-gray-900/g, 'bg-gray-900 text-white');
    content = content.replace(/dark:text-gray-300/g, 'text-gray-300');
    
    // Table headings
    content = content.replace(/bg-gray-50 dark:bg-gray-900\/50/g, 'bg-gray-800');
    content = content.replace(/bg-gray-100 dark:bg-gray-800/g, 'bg-gray-800');

    if (content !== original) {
      fs.writeFileSync(file, content);
      modifiedCount++;
      console.log(`Updated: ${file}`);
    }
  });
  console.log(`\nModified ${modifiedCount} files for text visibility.`);
});
