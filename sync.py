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
        if not line:
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
    def __init__(self, syncs: list[Sync]):
        self.syncs = syncs

    def check_entries(self, paths: list[Path], exclude: list[Path]):
        reference = paths[0]
        others = paths[1:]
        if reference in exclude:
            return
        if reference.is_file():
            content = path.read_text(encoding="utf-8")
            for other in others:
                other_path = other / path.name
                if not other_path.exists():
                    print(f"[ERROR] {path} != {other_path}: missing")
                    continue
                if not other_path.is_file():
                    print(f"[ERROR] {path} != {other_path}: is not a file")
                    continue
                other_content = other_path.read_text(encoding="utf-8")
                if other_content != content:
                    print(f"[ERROR] {path} != {other_path}: different")
                    continue
        else:
            for path in reference.glob("*"):
                if path in exclude:
                    continue
                if path.is_file():
                    content = path.read_text(encoding="utf-8")
                    for other in others:
                        other_path = other / path.name
                        if not other_path.exists():
                            print(f"[ERROR] {path} != {other_path}: missing")
                            continue
                        if not other_path.is_file():
                            print(f"[ERROR] {path} != {other_path}: is not a file")
                            continue
                        other_content = other_path.read_text(encoding="utf-8")
                        if other_content != content:
                            print(f"[ERROR] {path} != {other_path}: different")
                            continue
                else:
                    other_paths = [path]
                    for other in others:
                        other_path = other / path.name
                        if not other_path.exists():
                            print(f"[ERROR] {path} != {other_path}: missing")
                            continue
                        if other_path.is_file():
                            print(f"[ERROR] {path} != {other_path}: is a file")
                            continue
                        other_paths.append(other_path)
                    self.check_entries(other_paths, exclude)

    def check_sync(self, sync: Sync):
        print('[INFO] checking dirs:', sync.module)
        self.check_entries(sync.paths, sync.exclude)
        print()

    def check(self):
        for sync in self.syncs:
            if len(sync.paths) == 0:
                raise Exception()
            if len(sync.paths) == 1:
                continue

            self.check_sync(sync)


def parse_sync() -> list[Sync]:
    return SyncParser().parse_path(Path("./sync.txt"))


SyncChecker(parse_sync()).check()
