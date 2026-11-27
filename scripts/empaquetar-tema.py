"""Genera el ZIP de tema y una copia expandida para Shopify Theme Check."""
from pathlib import Path
from shutil import copytree, copy2
from tempfile import TemporaryDirectory
from zipfile import ZipFile, ZIP_DEFLATED
import argparse

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--directorio", type=Path, help="Guardar también el tema expandido")
args = parser.parse_args()
with TemporaryDirectory() as tmp:
    theme = Path(tmp) / "tema"
    copytree(root / "shopify", theme)
    assets = theme / "assets"
    for source in [*sorted((root / "assets/fonts").glob("*.woff2")),
                   *sorted((root / "assets/img").glob("*.svg")),
                   root / "assets/js/mascota.js", root / "assets/js/events.js"]:
        copy2(source, assets / source.name)
    css = (root / "assets/css/tienda.css").read_text().replace("../fonts/", "")
    (assets / "tienda.css").write_text(css)
    if args.directorio:
        copytree(theme, args.directorio, dirs_exist_ok=True)
    target = root / "dist/astroly-ventas-shopify.zip"
    target.parent.mkdir(exist_ok=True)
    with ZipFile(target, "w", ZIP_DEFLATED) as archive:
        for path in sorted(theme.rglob("*")):
            if path.is_file():
                archive.writestr(str(path.relative_to(theme)), path.read_bytes())
    print(target)
