#!/usr/bin/env node
// Adds the Microsoft Fabric item icons to this repository.
//
// Source: npm @fabric-msft/svg-icons (MIT), the `*_64_item.svg` variants.
// For each item: writes icons/fabric/<id>.svg (256x256, viewBox 0 0 64 64),
// icons/fabric/<id>.png (512x512, transparent), and adds the entry to
// icons.json, index.html (CATEGORIES) and README.md.
//
// Run from the repository root:
//   npm install --no-save sharp
//   node scripts/add-fabric-items.mjs
//
// Idempotent: an id that already exists in icons.json is skipped.

import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PACKAGE = '@fabric-msft/svg-icons';
const VERSION = '11.0.0';
const SIZE = 64; // the largest item master in the package
const OUT_DIR = 'icons/fabric';
const PNG_SIZE = 512;

// Workspace UI states, not products. Edit to taste.
const EXCLUDE = new Set([
  'generic_placeholder',
  'no_access_semantic_model',
  'restricted_report',
  'restricted_scorecard',
]);

// Display names where Title Case of the file stem is wrong.
const NAMES = {
  copy_job: 'Copy Job',
  custom_streaming_connector: 'Custom Streaming Connector',
  data_agent: 'Data Agent',
  data_factory: 'Data Factory',
  data_quality: 'Data Quality',
  data_warehouse: 'Warehouse',
  dataflow_gen2: 'Dataflow Gen2',
  event_house: 'Eventhouse',
  eventstream: 'Eventstream',
  experiments: 'ML Experiment',
  external_dataflow: 'External Dataflow',
  external_datamart: 'External Datamart',
  external_semantic_model: 'External Semantic Model',
  fabric_apps: 'Fabric Apps',
  feature_store: 'Feature Store',
  healthcare: 'Healthcare Data Solutions',
  kql_database: 'KQL Database',
  kql_queryset: 'KQL Queryset',
  kql_script: 'KQL Script',
  metric_sets: 'Metric Set',
  mirrored_catalog: 'Mirrored Catalog',
  mirrored_generic_database: 'Mirrored Database',
  mirrored_generic_storage: 'Mirrored Storage',
  mobile_report: 'Mobile Report',
  model: 'ML Model',
  operations_agent: 'Operations Agent',
  paginated_report: 'Paginated Report',
  rdl_report: 'RDL Report',
  real_time_dashboard: 'Real-Time Dashboard',
  retail: 'Retail Data Solutions',
  runtime_lineage: 'Runtime Lineage',
  schema_model: 'Schema Model',
  semantic_model: 'Semantic Model',
  shared_semantic_model: 'Shared Semantic Model',
  spark_job_direction: 'Spark Job Definition',
  sql_database: 'SQL Database',
  streaming_dataflow: 'Streaming Dataflow',
  streaming_semantic_model: 'Streaming Semantic Model',
  sustainability: 'Sustainability Data Solutions',
  user_data_functions: 'User Data Functions',
  variable_library: 'Variable Library',
};

// One line each, in the style of the existing entries. Microsoft Learn is the
// reference; adjust any that read wrong.
const DESCRIPTIONS = {
  action: 'An action item in a Fabric workspace, representing an executable step or operation.',
  apps: 'A Fabric app, a packaged collection of reports and dashboards distributed to consumers.',
  cohort: 'A patient or population cohort defined in Fabric healthcare data solutions.',
  copy_job: 'Data Factory copy job for simple, repeatable data movement from source to destination.',
  custom_streaming_connector: 'A custom connector that brings an external streaming source into an eventstream.',
  dashboard: 'Power BI dashboard, a single-page canvas of pinned visuals from one or more reports.',
  data_agent: 'Fabric data agent, a conversational AI agent that answers questions over workspace data.',
  data_factory: 'Data Factory in Fabric, the data integration workload for pipelines, dataflows and copy jobs.',
  data_quality: 'Data quality item for defining and monitoring quality rules over Fabric data.',
  data_warehouse: 'Fabric Warehouse, a lake-centric SQL data warehouse with full T-SQL support.',
  dataflow: 'Dataflow, a Power Query based item for ingesting and transforming data.',
  dataflow_gen2: 'Dataflow Gen2, the Fabric generation of Power Query dataflows with output destinations.',
  datamart: 'Datamart, a self-service relational database for small-scale analytics in Power BI.',
  environment: 'Fabric environment, a shared configuration of Spark compute, libraries and settings.',
  event_house: 'Eventhouse, the Real-Time Intelligence store that hosts one or more KQL databases.',
  eventstream: 'Eventstream, a no-code item for capturing, transforming and routing real-time events.',
  experiments: 'ML experiment, a container for tracking machine learning runs and their metrics.',
  exploration: 'Exploration, an ad-hoc data exploration item over a semantic model.',
  external_dataflow: 'A dataflow that lives in another workspace or tenant, referenced from this one.',
  external_datamart: 'A datamart that lives in another workspace or tenant, referenced from this one.',
  external_semantic_model: 'A semantic model that lives in another workspace or tenant, referenced from this one.',
  fabric_apps: 'Fabric apps, packaged solutions built on Fabric workloads.',
  feature_store: 'Feature store for registering, sharing and serving machine learning features.',
  healthcare: 'Healthcare data solutions in Fabric, for unifying clinical and operational data.',
  kql_database: 'KQL database, a Kusto database inside an eventhouse for time-series and log analytics.',
  kql_queryset: 'KQL queryset, a saved collection of Kusto queries over a KQL database.',
  kql_script: 'KQL script, a saved Kusto management or query script.',
  lakehouse: 'Lakehouse, a Delta-based data architecture combining data lake storage with SQL analytics.',
  links: 'Links, a collection of saved references to related Fabric items.',
  metric_sets: 'Metric set, a governed collection of reusable business metrics defined on a semantic model.',
  mirrored_catalog: 'Mirrored catalog, a continuously replicated external data catalog in OneLake.',
  mirrored_generic_database: 'Mirrored database, a near real-time replica of an external database in OneLake.',
  mirrored_generic_storage: 'Mirrored storage, a near real-time replica of external storage in OneLake.',
  mobile_report: 'Mobile report, a Power BI report laid out for phone screens.',
  model: 'ML model, a registered machine learning model with versions tracked in Fabric.',
  notebook: 'Notebook, an interactive Spark notebook for data engineering and data science.',
  ontology: 'Ontology, a semantic layer that defines entities and relationships over Fabric data.',
  operations_agent: 'Operations agent, an AI agent that monitors and acts on operational data in Fabric.',
  paginated_report: 'Paginated report, a pixel-perfect, print-ready report built with Report Builder.',
  pipeline: 'Data pipeline, an orchestration item for scheduling and chaining data activities.',
  planning: 'Planning, the Fabric item for business planning and forecasting scenarios.',
  rdl_report: 'RDL report, a Report Definition Language report hosted in Fabric.',
  real_time_dashboard: 'Real-Time dashboard, a live tile-based view over KQL data in Real-Time Intelligence.',
  report: 'Power BI report, an interactive multi-page view of a semantic model.',
  retail: 'Retail data solutions in Fabric, for unifying retail and commerce data.',
  runtime_lineage: 'Runtime lineage, the recorded data flow between items as jobs actually ran.',
  schema_model: 'Schema model, a shared schema definition used across Fabric data items.',
  scorecard: 'Scorecard, a Power BI item for tracking goals and metrics against targets.',
  semantic_model: 'Semantic model, the Power BI dataset that defines tables, relationships and measures.',
  shared_semantic_model: 'A semantic model shared from another workspace.',
  spark_job_direction: 'Spark job definition, a batch Spark job submitted to the Fabric runtime.',
  sql_database: 'SQL database in Fabric, a developer-friendly transactional database built on SQL Server.',
  streaming_dataflow: 'Streaming dataflow, a dataflow that transforms streaming data in Power BI.',
  streaming_semantic_model: 'Streaming semantic model, a Power BI dataset fed by real-time streaming data.',
  sustainability: 'Sustainability data solutions in Fabric, for ESG and emissions data.',
  user_data_functions: 'User data functions, serverless functions that run custom logic over Fabric data.',
  variable_library: 'Variable library, a set of workspace variables used to parameterise other items.',
};

const toKebab = (s) => s.replace(/_/g, '-');
const titleCase = (s) => s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

function fetchPackage() {
  const dir = mkdtempSync(join(tmpdir(), 'fabric-icons-'));
  execSync(`npm pack ${PACKAGE}@${VERSION} --silent`, { cwd: dir, stdio: 'pipe' });
  execSync('tar -xzf *.tgz', { cwd: dir, stdio: 'pipe', shell: '/bin/sh' });
  const pkg = JSON.parse(readFileSync(join(dir, 'package', 'package.json'), 'utf8'));
  if (pkg.license !== 'MIT') throw new Error(`Expected MIT, package.json says ${pkg.license}`);
  return join(dir, 'package', 'svg');
}

function normaliseSvg(svg) {
  // Package SVGs carry width/height but no viewBox. Match the repo convention:
  // width="256" height="256" with the original coordinate space as the viewBox.
  const m = svg.match(/^<svg([^>]*)>/);
  if (!m) throw new Error('no <svg> root');
  let attrs = m[1];
  if (!/viewBox=/.test(attrs)) attrs += ` viewBox="0 0 ${SIZE} ${SIZE}"`;
  attrs = attrs.replace(/\swidth="\d+"/, ' width="256"').replace(/\sheight="\d+"/, ' height="256"');
  // currentColor on the root is meaningless outside a document; pin it.
  attrs = attrs.replace(/fill="currentColor"/, 'fill="none"');
  return svg.replace(/^<svg[^>]*>/, `<svg${attrs}>`);
}

async function main() {
  for (const f of ['icons.json', 'index.html', 'README.md']) {
    if (!existsSync(f)) throw new Error(`run from the repository root (missing ${f})`);
  }
  const sharp = (await import('sharp')).default;
  const svgDir = fetchPackage();
  const files = readdirSync(svgDir).filter((f) => f.endsWith(`_${SIZE}_item.svg`)).sort();
  console.log(`${files.length} item icons at ${SIZE}px in ${PACKAGE}@${VERSION}`);

  const index = JSON.parse(readFileSync('icons.json', 'utf8'));
  const existing = new Set(index.icons.map((i) => i.id));
  mkdirSync(OUT_DIR, { recursive: true });

  const added = [];
  for (const file of files) {
    const stem = file.replace(`_${SIZE}_item.svg`, '');
    if (EXCLUDE.has(stem)) continue;
    const id = toKebab(stem);
    if (existing.has(id)) { console.log(`skip ${id} (exists)`); continue; }
    const name = NAMES[stem] ?? titleCase(stem);
    const desc = DESCRIPTIONS[stem];
    if (!desc) throw new Error(`no description for ${stem}; add one to DESCRIPTIONS`);

    const svg = normaliseSvg(readFileSync(join(svgDir, file), 'utf8'));
    const svgPath = `${OUT_DIR}/${id}.svg`;
    const pngPath = `${OUT_DIR}/${id}.png`;
    writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg), { density: 300 })
      .resize(PNG_SIZE, PNG_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    added.push({ id, name, category: 'fabric', categoryName: 'Fabric', description: desc, svg: svgPath, png: pngPath });
  }
  if (added.length === 0) { console.log('nothing to add'); return; }

  // icons.json: insert after the existing fabric entries, keep category order.
  const lastFabric = index.icons.map((i) => i.category).lastIndexOf('fabric');
  index.icons.splice(lastFabric + 1, 0, ...added);
  index.totalIcons = index.icons.length;
  const cat = index.categories.find((c) => c.id === 'fabric');
  cat.count = index.icons.filter((i) => i.category === 'fabric').length;
  writeFileSync('icons.json', JSON.stringify(index, null, 2) + '\n');

  // index.html: append to the fabric icons array in CATEGORIES.
  let html = readFileSync('index.html', 'utf8');
  const anchor = /(\n\s*id: "fabric",\n\s*name: "Fabric",\n\s*icons: \[\n)([\s\S]*?)(\n\s*\]\n\s*\},)/;
  if (!anchor.test(html)) throw new Error('fabric block not found in index.html');
  html = html.replace(anchor, (_, head, body, tail) => {
    const lines = added.map((i) => `      { id: "${i.id}", name: "${i.name}", desc: "${i.description.replace(/"/g, '\\"')}" }`);
    return head + body.replace(/\s*$/, '') + ',\n' + lines.join(',\n') + tail;
  });
  writeFileSync('index.html', html);

  // README.md: counts, quick-reference row, and the Fabric table.
  let readme = readFileSync('README.md', 'utf8');
  const total = index.totalIcons;
  readme = readme.replace(/\*\*\d+ product icons\*\*/, `**${total} product icons**`);
  const fabricNames = index.icons.filter((i) => i.category === 'fabric').map((i) => i.name).join(', ');
  readme = readme.replace(/^\| Fabric \| \d+ \| .*$/m, `| Fabric | ${cat.count} | ${fabricNames} |`);
  const rows = added.map((i) => `| <img src="${i.svg}" width="32" /> | **${i.name}** | \`${i.svg}\` |`).join('\n');
  const tableEnd = /(### Fabric\n\n\| Icon \| Product \| File \|\n\|[-| ]+\|\n(?:\|.*\n)+)/;
  if (!tableEnd.test(readme)) throw new Error('Fabric table not found in README.md');
  readme = readme.replace(tableEnd, (_, table) => table + rows + '\n');
  writeFileSync('README.md', readme);

  console.log(`added ${added.length}: ${added.map((i) => i.id).join(', ')}`);
  console.log(`icons.json now ${total} icons, fabric ${cat.count}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
