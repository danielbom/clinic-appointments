import argparse
import sys

from pathlib import Path
from typing import NamedTuple


class Sync(NamedTuple):
    module: str
    paths: list[Path]
    exclude: list[Path]


class SyncParser:
    def __init__(self):
        self.module = ""
        self.paths = []
        self.exclude = []
        self.result = []
    
    def update_module(self, next_module: str):
        if self.paths:
            if not self.module:
                raise Exception()
            self.result.append(Sync(module=self.module, paths=self.paths, exclude=self.exclude))
            self.paths = []
            self.exclude = []
        self.module = next_module
    
    def parse_line(self, line: str):
        line = line.strip()
        if not line or line.startswith("//"):
            return
        if line.startswith("[") and line.endswith("]"):
            self.update_module(line)
        elif line.startswith("!"):
            self.exclude.append(Path(line[1:]))
        else:
            self.paths.append(Path(line))
    
    def parse_path(self, path: Path):
        with path.open(encoding="utf-8") as file:
            for line in file:
                self.parse_line(line)
        self.update_module('')
        return self.result


class SyncChecker:
    def __init__(self, syncs: list[Sync], verbose: bool):
        self.syncs = syncs
        self.verbose = verbose
        self.current = None
        self.printed = False
        self.count_ok = 0
        self.count_fail = 0
    
    def fail(self, message):
        if not self.printed and self.current:
            print(self.current)
            self.printed = True
        self.count_fail += 1
        print(message)
    
    def _compare_files(self, path: Path, content: str, other: Path):
        if not other.exists():
            return self.fail(f"fail: {path} != {other}: missing")
        if not other.is_file():
            return self.fail(f"fail: {path} != {other}: is not a file")
        other_content = other.read_text(encoding="utf-8")
        if other_content != content:
            return self.fail(f"fail: {path} != {other}: different")
        if self.verbose:
            print(f"ok: {path} == {other}")
        self.count_ok += 1

    def check_entries(self, paths: list[Path], exclude: list[Path]):
        reference = paths[0]
        others = paths[1:]
        if reference in exclude:
            return
        if reference.is_file():
            path = reference
            content = path.read_text(encoding="utf-8")
            for other in others:
                self._compare_files(path, content, other)
        else:
            for path in reference.glob("*"):
                if path in exclude:
                    continue
                if path.is_file():
                    content = path.read_text(encoding="utf-8")
                    for other in others:
                        self._compare_files(path, content, other / path.name)
                else:
                    other_paths = [path]
                    for other in others:
                        other_path = other / path.name
                        if not other_path.exists():
                            self.fail(f"fail: {path} != {other_path}: missing")
                            continue
                        if other_path.is_file():
                            self.fail(f"fail: {path} != {other_path}: is a file")
                            continue
                        self.count_ok += 1
                        other_paths.append(other_path)
                    self.check_entries(other_paths, exclude)

    def check_sync(self, sync: Sync):
        self.current = f'checking: {sync.module}'
        self.printed = self.verbose
        if self.verbose:
            print(self.current)
        self.check_entries(sync.paths, sync.exclude)
        if self.printed:
            print()

    def check(self):
        for sync in self.syncs:
            if len(sync.paths) == 0:
                raise Exception()
            if len(sync.paths) == 1:
                continue

            self.check_sync(sync)

        code, result = (0, "ok: sync   ") if self.count_fail == 0 else (1, "fail: sync ")
        print(f"{result} ok: {self.count_ok:<5d} fail: {self.count_fail}")
        return code


def main():
    parser = argparse.ArgumentParser("Sync files")
    parser.add_argument("--path", default="sync.txt")
    parser.add_argument("-v", "--verbose", action="store_true", default=False)

    args = parser.parse_args()

    files = SyncParser().parse_path(Path(args.path))
    sys.exit(SyncChecker(files, args.verbose).check())


if __name__ == "__main__":
    main()
