# Repository structure — `defect-informatics/wbg-v2`

Kosmos, the Wide-Bandgap Semiconductor Defect Library, served at
**https://defect-informatics.github.io/wbg-v2/**

This repo is the *published artefact*, not the source. There is no build step here: the front end
is a pre-built bundle (`assets/index-*.js`), and every payload path is a string literal compiled
into it. **Moving or renaming anything under `data/` or `pages/` requires rewriting those literals
in the same commit**, or the viewer 404s while the page still loads and every gate still passes.

```
.
├── index.html                  the app shell; the only page that loads assets/ absolutely
├── .nojekyll                   stops GitHub Pages from filtering directories that start with _
├── assets/                     the built front end, shared by index.html only
│   ├── index-<hash>-r<rev>.js    the whole application (~2.6 MB); payload paths live in here
│   ├── index-<hash>-r<rev>.css   its stylesheet
│   └── moyo_wasm_bg-<hash>.wasm  symmetry engine, loaded by the JS (not by any HTML)
│
├── data/                       EVERY payload the app fetches. Nothing here is human-facing.
│   ├── *.jsongz                30 flat tables — one gzipped JSON per concern (see below)
│   ├── cifs/<mp-id>.jsongz       relaxed structures per host, keyed by defect and by complex
│   ├── trajs/<mp-id>.jsongz      relaxation trajectories, flat
│   ├── eqtraj/<mp-id>.jsongz     EquFlash trajectories
│   ├── mlfftraj/<model>_<mp-id>.jsongz   per-model MLFF trajectories (6 models x hosts)
│   ├── dfttraj/<mp-id>.jsongz    Quantum ESPRESSO trajectories
│   ├── snb/<mp-id>.jsongz        ShakeNBreak distortion summaries
│   └── snbtraj/<mp-id>/          ShakeNBreak trajectories, one directory per host
│
└── pages/                      self-contained sub-applications, each with its own index.html
    ├── traj/                     trajectory viewer
    ├── wbguniverse/              embedding / scatter explorer  (reads ../../data/scatter.jsongz)
    ├── cvxhull/                  convex-hull explorer
    ├── structgrid/               structure grid
    └── landscape/                energy-landscape viewer      (reads ../../data/defects.jsongz)
```

## What each flat table in `data/` is for

| file | job |
|---|---|
| `hosts.jsongz`, `xhosts.jsongz` | the host list and its extended form — what appears in the host dropdown |
| `hostinfo.jsongz` | per-host metadata: formula, space group, lattice, gap |
| `defects.jsongz` | the defect catalogue: names, classes, charge states |
| `defect_conditions.jsongz` | formation energies against chemical-potential conditions |
| `calc.jsongz` | the raw-data table behind the calculation view |
| `levels.jsongz` | charge-transition levels |
| `methods.jsongz`, `dft_settings.jsongz`, `recipes.jsongz` | provenance: which model or QE recipe produced a number |
| `tables.jsongz`, `si_tables.jsongz` | rendered summary and supplementary tables |
| `growthmap.jsongz`, `growthvertex.jsongz`, `growthwin.jsongz`, `growthmap_cifs.jsongz` | growth-condition maps, their vertices and windows, and the structures behind them |
| `gasmaps.jsongz`, `mu_tp.jsongz` | chemical potential to partial-pressure conversion |
| `dopwin.jsongz` | dopability windows |
| `electronic.jsongz` | electronic structure summaries |
| `anchors.jsongz`, `anneal.jsongz` | anchor references and annealing series |
| `bulks.jsongz` | relaxed host bulks |
| `complexgraph.jsongz` | which single defects combine into which complexes |
| `periodic.jsongz`, `periodic_roles.jsongz` | periodic-table colouring and element roles |
| `scatter.jsongz` | the embedding consumed by `pages/wbguniverse/` |
| `lookup.jsongz`, `xrefs.jsongz` | id lookup and cross-references |
| `coverage.jsongz` | which host/model pairs actually have data — drives the coverage banner |

## Rules for anyone editing this repo

1. **Payload paths are compiled into the bundle.** Before moving anything under `data/` or
   `pages/`, grep `assets/index-*.js` for the literal and rewrite it in the same commit.
   After the move, assert two things: no bare (unrewritten) literal remains, and every rewritten
   reference resolves to a file on disk.
2. **The two sub-apps that reach outside themselves** are `pages/wbguniverse/`
   (`../../data/scatter.jsongz`) and `pages/landscape/` (`../../data/defects.jsongz`). The other
   three are fully self-contained and use relative `./assets/…`.
3. **A directory URL with no `index.html` returns 404 on GitHub Pages.** That is expected for
   `data/*/` and is not a broken payload — probe an actual file.
4. **Filenames differ per payload kind.** `cifs/`, `trajs/`, `eqtraj/`, `dfttraj/`, `snb/` are
   `<mp-id>.jsongz`; `mlfftraj/` is `<model>_<mp-id>.jsongz`; `snbtraj/` is a directory per host.
   Probing `mlfftraj/<mp-id>.jsongz` returns 404 and means nothing.
5. **The flat tables and the structure payloads are built by different builders**, and the
   completeness gate only checks the flat ones. After any publish, open the host dropdown and the
   structure viewer in a real browser and count what they offer.

Builders live outside this repo, in `/eagle/wbg_defects/website/_builders/` on ALCF Eagle.
