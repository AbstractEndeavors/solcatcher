from abstract_utilities import *
import hjson
from itertools import combinations

def similarity(a, b):
    return len(a & b) / max(len(a | b), 1)

for (f1, s1), (f2, s2) in combinations(instr_sets.items(), 2):
    print(f"{f1} <-> {f2}: {similarity(s1, s2):.2%}")
def top_level_keys(idl):
    return set(idl.keys())

shapes = {
    f: top_level_keys(idl)
    for f, idl in idls.items()
}
def instruction_names(idl):
    return {
        i["name"]
        for i in idl.get("instructions", [])
        if "name" in i
    }
from itertools import combinations

def similarity(a, b):
    return len(a & b) / max(len(a | b), 1)

for (f1, s1), (f2, s2) in combinations(instr_sets.items(), 2):
    print(f"{f1} <-> {f2}: {similarity(s1, s2):.2%}")
instr_sets = {
    f: instruction_names(idl)
    for f, idl in idls.items()
base = next(iter(shapes.values()))
for f, keys in shapes.items():
    print(f)
    print("  missing:", base - keys)
    print("  extra:  ", keys - base)
abs_dir = get_caller_dir()
def deep_merge(dst: dict, src: dict) -> dict:
    for k, v in src.items():
        if (
            k in dst
            and isinstance(dst[k], dict)
            and isinstance(v, dict)
        ):
            deep_merge(dst[k], v)
        else:
            dst[k] = v
    return dst
def top_level_keys(idl):
    return set(idl.keys())
def load_idls(files):
    idls = {}
    for f in files:
        try:
            idls[f] = hjson.loads(Path(f).read_text())
        except Exception as e:
            print("LOAD FAIL:", f, e)
    return idls
shapes = {
    f: top_level_keys(idl)
    for f, idl in idls.items()
}

base = next(iter(shapes.values()))
for f, keys in shapes.items():
    print(f)
    print("  missing:", base - keys)
    print("  extra:  ", keys - base)
def safe_load_from_hjson(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return hjson.load(f)
    except Exception as e:
        print(f"[HJSON LOAD FAIL] {path}: {e}")
        return None
def create_path_from_here(path):
    new_abs_dir = os.path.join(abs_dir,'new')
    os.makedirs(new_abs_dir,exist_ok=True)
    rel_path = path.split(abs_dir)[-1]
    full_dir = new_abs_dir
    for part in [pa for pa in rel_path.split('/') if pa]:
        full_dir = os.path.join(full_dir,part)
        if not full_dir.endswith('.json'):
            os.makedirs(full_dir,exist_ok=True)
    shutil.move(path,full_dir)
    return 
datas = {}

new_abs_dir = os.path.join(abs_dir, "new")
dirs, files = get_files_and_dirs(new_abs_dir, allowed_exts=[".json"])

for file in files:
    dirname = os.path.dirname(file)
    parent_dir = os.path.dirname(dirname)
    parent_dirbase = os.path.basename(parent_dir)
    super_dir = os.path.dirname(parent_dir)
    super_dirbase = os.path.basename(super_dir)

    if "pump" in parent_dirbase or "pump" in super_dirbase:
        data = safe_load_from_hjson(file)
        for (f1, d1), (f2, d2) in combinations(disc_maps.items(), 2):
            overlap = set(d1) & set(d2)
            print(f"{f1} <-> {f2}")
            print("  shared discriminators:", len(overlap))
        if data:
            deep_merge(datas, data)

safe_dump_to_json(
    data=datas,
    file_path="/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator/src/imports/decoding/src/idls/new/consolidated.json",
)
