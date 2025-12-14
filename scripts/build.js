import { TRANSLATIONS } from "../translations.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify as cssoMinify } from "csso";
import { minify as uglifyMinify } from "uglify-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../");
const assetsSrcDir = path.join(root, "assets");
const distDir = path.join(root, "dist");
const assetsDistDir = path.join(distDir, "assets");

const defaultTranslations = TRANSLATIONS["en-gb"];
const ACTIVITY_KEYS = [
  "research",
  "analyse",
  "architect",
  "design",
  "develop",
  "deliver",
  "run",
];
const BASE_URL = "https://raadddr.digital";
const LICENSE = "https://creativecommons.org/public-domain/cc0/";
const USAGEINFO =
  "Public Domain (CC0). Attribution to https://raadddr.digital appreciated but not required.";
const DATEPUBLISHED = "2025-12-10T00:00:00Z";
const CURRENTDATEONLYSTR = new Date().toISOString();
const CODEREPO = "https://github.com/OllieJC/raadddr.digital";
const AUTHOR = "OllieJC <https://olliejc.uk>";

const getText = (data, key) =>
  data && data[key] !== undefined ? data[key] : defaultTranslations[key];

const getActivityField = (data, activityKey, suffix) => {
  const fullKey = `${activityKey}${suffix}`;
  return data && data[fullKey] !== undefined
    ? data[fullKey]
    : defaultTranslations[fullKey];
};

const buildMarkdown = (lang, data) => {
  const titleStr = getText(data, "title");
  let md = `# ${titleStr}\n\n`;

  const descriptionStr = getText(data, "description");
  md += `${descriptionStr}\n\n`;

  ACTIVITY_KEYS.forEach((key) => {
    const prefix = getActivityField(data, key, "Prefix");
    const label = getActivityField(data, key, "Label");
    const roles = getActivityField(data, key, "Roles") || [];
    const desc = getActivityField(data, key, "Desc");

    const prefixStr = prefix ? `${prefix} ` : "";
    md += `## ${prefixStr}${label}\n\n`;

    const rolesStr = Array.isArray(roles) ? roles.join(", ") : roles || "";
    md += `**Roles:** ${rolesStr}\n\n`;

    md += `${desc}\n\n`;
  });

  const footerLegalStr = getText(data, "footerLegal");
  md += `---\n\n${footerLegalStr}\n`;

  return md;
};

const generateLLMsText = () => {
  const lines = [];
  lines.push(`# ${defaultTranslations.title}`);
  lines.push("");
  lines.push(
    "> RAADDDR: Research, Analyse, Architect, Design, Develop, Deliver, and Run."
  );
  lines.push("");

  lines.push("## Description");
  lines.push(defaultTranslations.description);
  lines.push("");

  lines.push("## Full markdown for each language");
  Object.keys(TRANSLATIONS).forEach((lang) => {
    lines.push(`- [${lang} language](${BASE_URL}/raadddr.${lang}.md)`);
  });
  lines.push("");

  lines.push("## Human different language URLs");
  Object.keys(TRANSLATIONS).forEach((lang) => {
    lines.push(`  - [language ${lang}](${BASE_URL}/#${lang})`);
  });
  lines.push("");

  lines.push("## Human activity URLs (defaults to browser language)");
  ACTIVITY_KEYS.forEach((key) => {
    lines.push(`  - [${key} activity](${BASE_URL}/#${key})`);
  });
  lines.push("");

  lines.push("## Meta");
  lines.push(`- Date Published: ${DATEPUBLISHED}`);
  lines.push(`- Date Modified: ${CURRENTDATEONLYSTR}`);
  lines.push(`- [Code Repository](${CODEREPO})`);
  lines.push(`- Author: ${AUTHOR}`);
  lines.push(`- [License](${LICENSE})`);
  lines.push(`- Usage Info: ${USAGEINFO}`);
  lines.push(
    `- Logo (transparent, but solid black background recommended): <${BASE_URL}/assets/logo.svg>`
  );
  lines.push("");

  return lines.join("\n");
};

const buildJSONLD = (lang, data) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["DefinedTermSet", "Article", "LearningResource"],
    "@id": "https://raadddr.digital/",
    name: "RAADDDR",
    image: `https://raadddr.digital/assets/logo.svg`,
    headline: getText(data, "title"),
    description: getText(data, "description"),
    inLanguage: lang,
    url: `https://raadddr.digital/#${lang}`,

    educationalUse: getText(data, "metaEducationalUse"),
    learningResourceType: getText(data, "metaLearningResourceType"),
    teaches: getText(data, "metaTeaches"),
    accessMode: "textual",

    license: LICENSE,
    usageInfo: USAGEINFO,
    datePublished: DATEPUBLISHED,
    dateModified: CURRENTDATEONLYSTR,
    author: {
      "@type": "Person",
      "@id": "https://olliejc.uk",
      name: "OllieJC",
      url: "https://olliejc.uk",
      sameAs: [
        "https://github.com/OllieJC",
        "https://www.linkedin.com/in/olliejc/",
        "https://bsky.app/profile/olliejc.uk",
        "https://dev.to/olliejc",
      ],
    },
    sameAs: CODEREPO,
    hasDefinedTerm: [],
    about: {
      "@type": "Thing",
      name: getText(data, "metaLearningResourceType"),
    },
  };

  ACTIVITY_KEYS.forEach((key) => {
    const prefix = getActivityField(data, key, "Prefix");
    const label = getActivityField(data, key, "Label");
    const roles = getActivityField(data, key, "Roles") || [];
    const desc = getActivityField(data, key, "Desc");

    const fullName = prefix ? `${prefix} ${label}` : label;

    const jsonLdPart = {
      "@type": ["DefinedTerm", "DefinedTermSet"],
      "@id": `https://raadddr.digital/#${key}`,
      name: fullName,
      description: desc,
      inDefinedTermSet: { "@id": "https://raadddr.digital/" },
      about: {
        "@type": "Thing",
        name: "Activity",
      },
      hasDefinedTerm: [],
    };

    if (roles) {
      roles.forEach((role) => {
        const rolePart = {
          "@type": "DefinedTerm",
          //"@id": `https://raadddr.digital/#{${role}`,
          name: role,
          about: {
            "@type": "Thing",
            name: "Role",
          },
          inDefinedTermSet: { "@id": `https://raadddr.digital/#${key}` },
        };
        jsonLdPart.hasDefinedTerm.push(rolePart);
      });
    }

    jsonLd.hasDefinedTerm.push(jsonLdPart);
  });

  return JSON.stringify(jsonLd, null);
};

const buildIndex = async () => {
  let indexContent = await fs.readFile(path.join(root, "index.html"), "utf8");

  indexContent = indexContent.replace(
    /<title><\/title>/,
    `<title>${defaultTranslations.title}</title>`
  );
  indexContent = indexContent.replace(
    /<h1 id="title" data-i18n="title"><\/h1>/,
    `<h1 id="title" data-i18n="title">${defaultTranslations.title}</h1>`
  );

  let desc = defaultTranslations.description;
  desc = desc
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
    .replace(/\n/g, "<br>\n");
  indexContent = indexContent.replace(
    /data-i18n="description"></,
    `data-i18n="description">${desc}<`
  );

  indexContent = indexContent.replace(
    /data-i18n="chooseActivity"></,
    `data-i18n="chooseActivity">${defaultTranslations.chooseActivity}<`
  );

  ACTIVITY_KEYS.forEach((key) => {
    const letter = getActivityField(defaultTranslations, key, "Letter");
    const prefix = getActivityField(defaultTranslations, key, "Prefix");
    const label = getActivityField(defaultTranslations, key, "Label");
    const roles = getActivityField(defaultTranslations, key, "Roles") || [];
    const descVal = getActivityField(defaultTranslations, key, "Desc");

    const prefixStr = prefix ? `${prefix} ` : "";

    indexContent = indexContent.replace(
      new RegExp(`data-i18n="${key}Letter"><`),
      `data-i18n="${key}Letter">${letter}<`
    );

    indexContent = indexContent.replace(
      new RegExp(`data-i18n="${key}Prefix"><`),
      `data-i18n="${key}Prefix">${prefixStr}<`
    );

    indexContent = indexContent.replace(
      new RegExp(`data-i18n="${key}Label"><`),
      `data-i18n="${key}Label">${label}<`
    );

    indexContent = indexContent.replace(
      new RegExp(`data-i18n="${key}Desc"><`),
      `data-i18n="${key}Desc">${descVal}<`
    );

    const rolesHtml = roles
      .map((role) => `<span class="role-pill">${role}</span>`)
      .join("");

    indexContent = indexContent.replace(
      new RegExp(`id="${key}Roles"><\\/div>`),
      `id="${key}Roles">${rolesHtml}</div>`
    );
  });

  const metaItems = [];

  Object.entries(TRANSLATIONS).forEach(([lang, data]) => {
    metaItems.push(
      `<link rel="alternate" type="text/markdown" href="https://raadddr.digital/raadddr.${lang}.md" hreflang="${lang}">`
    );

    if (lang !== "en-gb") {
      metaItems.push(
        `<link rel="alternate" type="application/ld+json" href="https://raadddr.digital/raadddr.${lang}.jsonld" hreflang="${lang}">`
      );
      metaItems.push(
        `<link rel="alternate" hreflang="${lang}" href="https://raadddr.digital/#${lang}">`
      );
    } else {
      const jsonLDContent = buildJSONLD(lang, data);
      metaItems.push(
        `<script type="application/ld+json">${jsonLDContent}</script>`
      );
      metaItems.push(
        `<link rel="alternate" hreflang="${lang}" href="https://raadddr.digital/">`
      );
    }
  });

  indexContent = indexContent.replace(
    "<!-- METATAGS -->",
    metaItems.join("\n")
  );

  const mainCSS = await fs.readFile(
    path.join(assetsSrcDir, "main.css"),
    "utf8"
  );
  const minifiedCSS = cssoMinify(mainCSS).css;
  indexContent = indexContent.replace(
    "<!-- MAIN CSS -->",
    `<style>${minifiedCSS}</style>`
  );

  const translationsStr = `const TRANSLATIONS = ${JSON.stringify(
    TRANSLATIONS
  )};`;

  const mainJs = await fs.readFile(path.join(assetsSrcDir, "main.js"), "utf8");
  const minifiedJs = uglifyMinify(mainJs, {
    compress: true,
    mangle: true,
  }).code;
  indexContent = indexContent.replace(
    "<!-- MAIN JS -->",
    `<script type="module">${translationsStr}${minifiedJs}</script>`
  );

  const indexFile = path.join(distDir, "index.html");
  await fs.writeFile(indexFile, indexContent, "utf8");
};

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        return copyRecursive(srcPath, destPath);
      })
    );
  } else {
    const ext = path.extname(src).toLowerCase();
    if (ext === ".css") {
      return;
    }
    if (ext === ".js") {
      return;
    }
    await fs.copyFile(src, dest);
  }
}

async function copyAssets() {
  await fs.mkdir(assetsDistDir, { recursive: true });
  await copyRecursive(assetsSrcDir, assetsDistDir);
}

async function buildSitemap() {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    "  <url>",
    `    <loc>${BASE_URL}/</loc>`,
    `    <lastmod>${CURRENTDATEONLYSTR}</lastmod>`,
  ];

  Object.keys(TRANSLATIONS).forEach((lang) => {
    const href = lang === "en-gb" ? `${BASE_URL}/` : `${BASE_URL}/#${lang}`;
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`
    );
  });

  lines.push("  </url>", "</urlset>");

  const sitemapPath = path.join(distDir, "sitemap.xml");
  await fs.writeFile(sitemapPath, lines.join("\n"), "utf8");
}

async function main() {
  await fs.mkdir(distDir, { recursive: true });
  await fs.mkdir(assetsDistDir, { recursive: true });

  for (const [lang, data] of Object.entries(TRANSLATIONS)) {
    const mdContent = buildMarkdown(lang, data);
    await fs.writeFile(
      path.join(distDir, `raadddr.${lang}.md`),
      mdContent,
      "utf8"
    );

    const jsonLDContent = buildJSONLD(lang, data);
    await fs.writeFile(
      path.join(distDir, `raadddr.${lang}.jsonld`),
      jsonLDContent,
      "utf8"
    );
  }

  await buildIndex();
  await copyAssets();
  await copyRecursive(
    path.join(root, "_headers"),
    path.join(distDir, "_headers")
  );
  await copyRecursive(
    path.join(root, "robots.txt"),
    path.join(distDir, "robots.txt")
  );
  const llmsText = generateLLMsText();
  await fs.writeFile(path.join(distDir, "llms.txt"), llmsText, "utf8");
  await buildSitemap();
}

main()
  .then(() => {
    console.log("Distribution files generated!");
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exitCode = 1;
  });
