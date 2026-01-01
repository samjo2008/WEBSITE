
/**
 * Eleventy config — non-breaking enhancements
 * - Passthrough: src/assets, src/_redirects, src/_headers
 * - Collections: galleries & digital library
 * - Template engines/directories unchanged
 */
module.exports = function(eleventyConfig) {
  const fs = require("fs");
  const path = require("path");

  /* ----------------------------
     PASSTHROUGH
  ----------------------------- */
  // Copy the entire src/assets (covers gallery and digital-library)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Copy Netlify redirects & headers files to the output folder
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/_headers");

  /* ----------------------------
     GALLERY COLLECTIONS
  ----------------------------- */
  const galleries = [
    { key: "meskelGallery", folder: "Meskel" },
    { key: "genaGallery", folder: "Gena" },
    { key: "timketGallery", folder: "Timket" },
    { key: "fasikaGallery", folder: "Fasika" },
    { key: "kidanemihretYekatitGallery", folder: "KidanemihretYekatit" },
    { key: "kidanemihretNehaseGallery", folder: "KidanemihretNehase" }
  ];

  galleries.forEach(({ key, folder }) => {
    eleventyConfig.addCollection(key, () => {
      const dir = `src/assets/gallery/${folder}`;
      if (!fs.existsSync(dir)) {
        console.warn(`[gallery] Missing folder: ${dir}`);
        return [];
      }
      const files = fs
        .readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .map(f => `/assets/gallery/${folder}/${f}`);

      if (files.length === 0) {
        console.warn(`[gallery] No images found in: ${dir}`);
      }
      return files;
    });
  });

  /* ----------------------------
     DIGITAL LIBRARY COLLECTIONS
  ----------------------------- */
  function listPdfs(subfolder) {
    const dir = path.join("src/assets/digital-library", subfolder);
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .filter(f => /\.pdf$/i.test(f))
      .map(f => {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        return {
          url: `/assets/digital-library/${subfolder}/${f}`, // public URL
          name: f.replace(/\.pdf$/i, ""),                   // title without extension
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2),   // optional display size
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));        // alphabetical
  }

  eleventyConfig.addCollection("religionAdults", () => listPdfs("religion-adults"));
  eleventyConfig.addCollection("prayerAdults",   () => listPdfs("prayer-adults"));
  eleventyConfig.addCollection("prayerChildren", () => listPdfs("prayer-children"));

  /* ----------------------------
     ELEVENTY DIR/ENGINES
  ----------------------------- */
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "public",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
``
