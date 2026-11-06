# Reproducible examiner geometry

Run Blender 4.3 or later from the project root:

    blender -b -t 4 --python scripts/build-examiner-model.py

The script builds the local GLB and updates its SHA-256 manifest. Three gzip JSON files contain fitted CC0 geometry (head/hands only, tailored suit, hair). It does not require MPFB or internet access to rebuild. The optional inspection image is a Blender render and is never used as an in-app image plane.

Original source notices and URLs: public/models/examiner/NOTICE.md. CC0 text: public/licenses/MAKEHUMAN-CC0.txt.

Anatomy was fitted with MPFB 6ff1eb358f6c1959ced77e79e6dd2406d9a71f49, male young-adult macro, Asian/Caucasian blend .85/.15, muscle .5, weight .42. A mild mouth-corner expression is included. Suit3 was fitted to the same body with the game_engine rig and symmetric wrist IK targets at the desk. Components retain the authored jacket, shirt, cuffs and buttons; the tie and original leg pose are excluded from the rendered asset. Hair uses the same fitted head transform. All app geometry is local and no user identity or audio is included.

## Uploaded Gaussian reference

The default character now uses the owner's supplied `idol-seed7-262144-be1b0ef4.ply`. It is not part of the CC0 sources above and no new CC0 license is asserted for the upload. The original upload remains outside the repository. Its SHA-256 is recorded in `public/models/examiner/reference.json`.

To regenerate from that original file (Python NumPy and Playwright Chromium required):

    python scripts/prepare-examiner-reference.py /path/to/original.ply /tmp/examiner-cropped.ply
    node scripts/compress-examiner-reference.cjs /tmp/examiner-cropped.ply

Set PLAYWRIGHT_EXECUTABLE_PATH if using a system Chromium. The bounds and native Gaussian spectacle-rim reconstruction in the Python script are specific to this reference. The compression server binds only to loopback and sends nothing to outside services. Spark is pinned and served in the app's JavaScript; its MIT notice is in public/licenses. The mesh GLB remains a glasses-free fallback.
