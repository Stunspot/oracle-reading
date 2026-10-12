#!/bin/sh
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! /usr/bin/osascript -l JavaScript ./skills/oracle-reading/assets/oracle-native-icons.js "$PWD/skills/oracle-reading/assets/oracle.icns" "$PWD/Launch Oracle Reading.command"; then
  printf '%s\n' 'Oracle icon binding unavailable; opening the table.' >&2
fi
python3 -B serve.py --open
