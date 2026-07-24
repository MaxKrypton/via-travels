const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const ignoredDirs = new Set(["node_modules", ".expo", "dist", "ios", "android"]);
const glyphMapAliases = {
  FontAwesome5: "FontAwesome5Free",
  FontAwesome6: "FontAwesome6Free",
};
const iconPackageImport = /import\s+\{([^}]+)\}\s+from\s+["']@expo\/vector-icons["']/g;
const iconFamilyImport =
  /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']@expo\/vector-icons\/([^"']+)["']/g;

function getSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...getSourceFiles(path.join(dir, entry.name)));
      }
      continue;
    }

    if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

function loadGlyphMap(family) {
  const glyphMapName = glyphMapAliases[family] || family;
  const candidates = [
    path.join(
      projectRoot,
      "node_modules",
      "@expo",
      "vector-icons",
      "build",
      "vendor",
      "react-native-vector-icons",
      "glyphmaps",
      `${glyphMapName}.json`,
    ),
    path.join(
      projectRoot,
      "node_modules",
      "react-native-vector-icons",
      "glyphmaps",
      `${glyphMapName}.json`,
    ),
  ];

  const glyphMapPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!glyphMapPath) {
    throw new Error(`Could not find glyph map for ${family}`);
  }

  return require(glyphMapPath);
}

function getIconImports(source) {
  const imports = new Map();
  let match;

  iconPackageImport.lastIndex = 0;
  while ((match = iconPackageImport.exec(source))) {
    for (const specifier of match[1].split(",")) {
      const [family, alias] = specifier.trim().split(/\s+as\s+/);
      if (family) {
        imports.set(alias || family, family);
      }
    }
  }

  iconFamilyImport.lastIndex = 0;
  while ((match = iconFamilyImport.exec(source))) {
    imports.set(match[1], match[2]);
  }

  return imports;
}

function getLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

const glyphMaps = new Map();
const invalidIcons = [];

for (const filePath of getSourceFiles(projectRoot)) {
  const source = fs.readFileSync(filePath, "utf8");
  const imports = getIconImports(source);

  for (const [localName, family] of imports) {
    if (!glyphMaps.has(family)) {
      glyphMaps.set(family, loadGlyphMap(family));
    }

    const glyphMap = glyphMaps.get(family);
    const iconUsage = new RegExp(
      `<${localName}\\b[^>]*\\bname=(["'])([^"']+)\\1`,
      "g",
    );

    let match;
    while ((match = iconUsage.exec(source))) {
      const iconName = match[2];
      if (!Object.prototype.hasOwnProperty.call(glyphMap, iconName)) {
        invalidIcons.push({
          filePath,
          line: getLineNumber(source, match.index),
          family,
          iconName,
        });
      }
    }
  }
}

if (invalidIcons.length > 0) {
  console.error("Invalid @expo/vector-icons names found:");
  for (const invalidIcon of invalidIcons) {
    const relativePath = path.relative(projectRoot, invalidIcon.filePath);
    console.error(
      `- ${relativePath}:${invalidIcon.line} ${invalidIcon.family} "${invalidIcon.iconName}"`,
    );
  }
  process.exit(1);
}

console.log("All literal @expo/vector-icons names are valid.");
