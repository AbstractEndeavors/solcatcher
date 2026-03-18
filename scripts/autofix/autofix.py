#!/usr/bin/env python3
import subprocess, sys,shutil,os
ROOT_DIRECTORY = "/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT"
MIRROR_BASENAME = "aggregator"
CLEAN_BASENAME = f"{MIRROR_BASENAME}_clean"
CLEAN_ROOT = os.path.join(ROOT_DIRECTORY,CLEAN_BASENAME)
ENTRY      = os.path.join(CLEAN_ROOT,"clients/main-cli.ts")
def copy_mirrored_file(output,txt):
    file_path = output.split(txt)[1].split("'")[0]
    dirname = os.path.dirname(file_path)
    basename = os.path.basename(file_path)
    filename,ext = os.path.splitext(basename)
    mirror_dirname = dirname.replace(CLEAN_BASENAME,MIRROR_BASENAME)
    if 'workflows/src' in str(mirror_dirname):
        mirror_dirname=mirror_dirname.replace('workflows/src','workflows/logData')
    input(mirror_dirname)
    for mirror_basename in os.listdir(mirror_dirname):
        mirror_filename,mirror_ext = os.path.splitext(mirror_basename)
        if mirror_filename == filename:
            mirror_file = os.path.join(mirror_dirname,mirror_basename)
            input(mirror_file)
            shutil.copy(mirror_file,dirname)
while True:
    result = subprocess.run(
        ["npx", "tsx", ENTRY],
        cwd=CLEAN_ROOT,
        capture_output=True,
        text=True,
    )

    output = (result.stdout + result.stderr).strip()
    
    if 'No such file or directory: ' in output:
        copy_mirrored_file(output,'No such file or directory: ')
        input(output)
    elif "Cannot find module '" in output:
        copy_mirrored_file(output,"Cannot find module '" )
        input(output)
    else:
        pretext = '/run/user/1000/gvfs/sftp:host=192.168.0.100,user=solcatcher'
        if 'file:///' in output:
            rel_path = output.split('file:///')[1].split(':')[0]
            nupath = f"{pretext}/{rel_path}"
            input(nupath)

        break
input(output)
sys.exit(result.returncode)
