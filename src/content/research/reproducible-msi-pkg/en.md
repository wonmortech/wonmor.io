---
title: "Reproducible MSI and .pkg builds, and the timestamp traps inside"
description: "Building the bitg installers twice from one commit used to give two different files. We removed the differences layer by layer: compiler, linker, WiX, the OLE container, and the xar archive behind every macOS package. The last four bytes were written by the very call that saved our fix."
date: 2026-11-13
kind: engineering
area: supply-chain
featured: false
source:
  - "https://github.com/dtwinuz/bitg/pull/48"
  - "https://github.com/dtwinuz/bitg/commit/f410210edb7520090b6cebc5456ba7d5571d840d"
  - "dtwinuz/bitg installer/build.ps1, macos/build.sh, tools/xar_normalize.py, linux/build-deb.sh"
  - "https://github.com/dtwinuz/bitg/actions/runs/43315704109"
  - "https://github.com/dtwinuz/bitg/actions/runs/43367788719"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "On Ubuntu with libibus-1.0-dev and dpkg-dev, the two builds print identical SHA-256 sums; the last command checks the signed provenance of a released package."
  commands:
    - "git worktree add --detach ../bitg-second HEAD"
    - "linux/build-deb.sh && (cd ../bitg-second && linux/build-deb.sh)"
    - "sha256sum target/deb/*.deb ../bitg-second/target/deb/*.deb"
    - "pwsh installer/build.ps1 -Version 0.3.1   # Windows: run in both worktrees, then compare Get-FileHash dist/*.msi"
    - "gh release download v0.3.1 -R dtwinuz/bitg -p 'bitg_0.3.1_amd64.deb' && gh attestation verify bitg_0.3.1_amd64.deb -R dtwinuz/bitg"
---

bitg is an input method: a DLL that Windows loads into every application where you type. That is a lot of trust to ask for, so every bitg release ships with signed build provenance that says which workflow built each file from which commit. Provenance tells you who built a file. It does not let you check the claim yourself. A reproducible build does: anyone can build the same commit and compare hashes.

Our Linux `.deb` packages were already reproducible in v0.3.1. The Windows MSI and the macOS `.pkg` were not. Two builds of one commit gave two different files. This post is about what was different, layer by layer, and the traps we hit along the way. The work landed in PR #48 on 13 November 2026.

## How we searched

The method was dull on purpose: two git worktrees of the same commit, the same build script in each, compare SHA-256, and when they differ, compare one layer down. The CI checks that now guard this do the same thing. They add a second worktree on the runner, build again, and fail the job if the hashes differ, printing per-binary hashes so the next difference is easy to find.

```steps
Binaries :: Make the compiled DLL and executables identical first; nothing above them can be stable otherwise.
Tables :: Make the installer database identical: product codes, package code, file times.
Metadata :: Pin the summary information that the installer tool stamps with the current time.
Container :: Fix the timestamps in the file format that holds everything, OLE for MSI and xar for .pkg.
Guard :: Build twice in CI on every relevant change and fail on any difference.
```

The starting point on Windows was two MSIs with hashes beginning `52E6606B` and `536D7B00`.

## Layer one: the binaries

Three things made the Rust binaries differ between worktrees. The PE header carries a link timestamp. The debug directory carries a PDB GUID and the full path of the PDB file. And panic messages and debug info embed absolute source paths, which differ when the worktree lives in a different folder.

The MSVC linker handles the first two with `/Brepro`, which replaces the timestamp with a hash of the output, and `/PDBALTPATH:%_PDB%`, which stores only the PDB file name. Both went into `.cargo/config.toml` for all three Windows targets. Paths are handled by `--remap-path-prefix`, which rewrites the repository root to `/build/bitg` and the cargo home to `/cargo`. Because these are absolute paths known only at build time, `installer/build.ps1` passes them on the command line through `cargo --config` rather than committing them.

After that, all four binaries matched, including the 32-bit text-service DLL we ship for older applications. The MSIs still did not.

## Layer two: WiX, and what a product code should mean

Diffing the MSI tables showed three differences: the ProductCode, the PackageCode, and dates. WiX generates a fresh random ProductCode and PackageCode on every build unless told otherwise, and it records file modification times in the cabinet.

File times were easy: before building, every payload file's modification time is set to the commit time (or `SOURCE_DATE_EPOCH` if set). The product code took more thought, because it is not just a number. Windows Installer uses it to decide whether a package is a new product, the same product, or an upgrade. A constant code would be reproducible but wrong: a corrected build of the same version would look identical to the old one.

We derive both codes as name-based UUIDs (version 5), using the installer's fixed UpgradeCode as the namespace and a name made of the version and the SHA-256 of every installed file plus the WiX source:

```text
seed        = "bitg-x64|<version>|" + sha256(each payload file, Package.wxs) joined by "|"
ProductCode = UUIDv5(UpgradeCode, seed + "|product")
PackageCode = UUIDv5(UpgradeCode, seed + "|package")
```

Same inputs, same codes. A rebuilt binary at the same version gets a new code and installs as an upgrade, which the installer already allows. The project file now refuses to build without a ProductCode, so the MSI can only be produced through the script that computes it.

## Layer three: the summary stream and the four bytes

WiX writes three summary-information properties that matter here: the PackageCode (property 9), and the creation and last-saved times (12 and 13), which it sets to "now". `build.ps1` opens the finished MSI through the `WindowsInstaller.Installer` COM object, writes those three properties, persists the summary stream and commits the database.

The first trap was mundane. `OpenDatabase` failed with `DISP_E_TYPEMISMATCH` until the path, produced by `Join-Path`, was cast explicitly to `[string]`, presumably because PowerShell otherwise hands late-bound COM a wrapped object rather than a plain string.

The second trap was the interesting one. After all of the above, the two MSIs differed in exactly four bytes, at offset 8300. An MSI is an OLE compound file, a small file system inside a file, and that offset was the modified time of its root directory entry. Nothing in our script wrote it. `Commit` did: saving the database stamps the container's root entry with the current time. The fix that pins every other timestamp was itself writing a fresh one.

So after the COM objects are released, the script edits the file directly. It reads the directory's first sector and the sector size from the compound-file header, finds the root entry, checks that its name really is `Root Entry`, and writes the commit time as a FILETIME at offset 108 within that entry. With that, both worktrees produced `13d83566…50ac`. In CI, the end-to-end workflow built the MSI twice on a Windows runner and got the same hash both times (`50d53ccb…37f4`, run 43315704109).

## The .pkg: an archive format with no options

macOS needed the same binary work in its own dialect: `--remap-path-prefix` for Rust, `-file-prefix-map` for Swift (which otherwise embeds `#file` paths), `ZERO_AR_DATE=1` so static libraries carry no member dates, and `-Xlinker -S` so the linker does not write a debug map that records the full path of the static library and temporary object names. Every file in the package staging folder, including install scripts, is touched to the commit time before `pkgbuild` runs.

That was not enough, because of the archive itself. A `.pkg` is a xar archive: a binary header, a zlib-compressed XML table of contents, then a heap of file data. `pkgbuild` writes the archive's creation time into the table of contents, plus ctime, mtime and atime for its internal files (Bom, Payload, Scripts, PackageInfo), plus the builder's user, group, device and inode numbers. There is no option to control any of it.

`tools/xar_normalize.py` rewrites those fields after the fact: every time tag becomes the commit time, owners become `root`/`wheel` with id 0, device numbers become 0, and inodes are renumbered sequentially so they stay unique. It then recompresses the table of contents and recomputes its checksum, a SHA-1 stored at offset 0 of the heap. File data and the checksums of individual files are not touched. The script refuses to run on a signed archive, because changing the table of contents would break the signature. After normalising, the build runs `pkgutil --payload-files` to confirm macOS still reads the package. We tested the script on the real `.pkg` from the v0.3.1 release before trusting it: the new checksum was correct and the heap was unchanged byte for byte. On a later push to `main` (run 43367788719), the macOS job built the package twice and got `ffd25c79…0e0c` both times.

## Limitations

- **Unsigned only.** The guarantee covers the unsigned MSI and the ad-hoc-signed `.pkg`. Authenticode and Developer ID signatures add their own timestamps and certificate data; a signed release would need a "strip signature, then compare" step that we have not written.
- **Same machine, same toolchain.** The CI checks build twice on one runner. That catches timestamps and paths, not differences between compiler versions, SDKs or runner images. No one outside the project has rebuilt a release and compared it yet.
- **We fixed the formats we found.** The CFB root-entry offset and the xar fields are handled because a diff pointed at them. A new WiX, `pkgbuild` or linker version could add a field we do not know about. The CI check would catch that, but only after the change.
- **One build path.** The MSI can now only be built through `build.ps1`. That is deliberate, but it means the project file is no longer usable on its own.

The lesson we took from the four bytes: when you pin timestamps, check what the save itself writes.
