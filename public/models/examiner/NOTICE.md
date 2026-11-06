# Examiner model sources

The app serves a real local glTF 2.0 character. No portrait image or remote avatar service is used.

Anatomical face, ears, neck and hands: MakeHuman / MPFB basemesh and shape targets, CC0 1.0. Source: https://github.com/makehumancommunity/mpfb2 at 6ff1eb358f6c1959ced77e79e6dd2406d9a71f49. Original base asset credits: Data Collection AB, Joel Palmius, Jonas Hauquier. See the included MAKEHUMAN-CC0.txt.

Tailored jacket, shirt, cuffs and buttons: Suit3 by MRT / Margaret Toigo, CC0, from the MakeHuman Community suits01 CC0 asset pack. The tie is omitted; shirt opening, pose and materials are adapted. Source: https://static.makehumancommunity.org/assets/assetpacks/suits01.html (toigo_male_suit_3, UUID 9c398af4-7859-42e2-ab83-96ac50f45966).

Swept hair: culturalibre_hair_05 by culturalibre, original by swift502, CC0 / CC-0. Source: https://static.makehumancommunity.org/assets/assetpacks/hair01.html, UUID ca162603-99da-4bff-b6b8-cbc0a67e3c26.

Original adjustments and accessories are built in scripts/build-examiner-model.py. The fitted source geometry is in scripts/assets/. These source-asset notices do not change the app's existing software terms.

Default reference (2026-11-06): owner-supplied `idol-seed7-262144-be1b0ef4.ply`, cropped and processed into `provided-examiner.spz`. Its original-file SHA-256 and processing summary are in `reference.json`. This supplied model is distinct from the CC0 mesh assets above; those notices do not declare a license for the owner's upload. Spark rendering code is MIT-licensed, see public/licenses/SPARK-MIT.txt. The supplied face colors are preserved; continuous fine Gaussian spectacle rims reinforce the reference without aliased triangle-line frames. The mesh fallback has no glasses.
