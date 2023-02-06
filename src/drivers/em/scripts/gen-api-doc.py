#!/usr/bin/env python3

class Meta:
  def __init__(self, **vargs):
    self.__dict__ = vargs

def write_index_d_ts(f, functions, settings):
  # Settings.
  f.write('interface SettingsMap {\n')
  for s in settings:
    f.write(f'  \'{s.name}\': {s.type};\n')
  f.write('}\n\n')

  # Functions prologue.
  f.write("""\
  interface EventMap {
  'game-loaded': (filename: string) => any;
}

interface SaveFiles {
  [filename: string]: Uint8Array;
}

export default function FCEUX(params?): Promise<FceuxModule>;

export class FceuxModule {
""")

  # Functions.
  for fn in functions:
    comment = '  ' + '\n  '.join(fn.lines)
    f.write(f'  {fn.declaration};\n')

  # Functions epilogue.
  f.write("""\

  _audioContext?: AudioContext; // Web Audio context created by init().
  _defaultConfig: SettingsMap; // Default settings. Do not modify.

  // Exposed Emscripten module properties:
  then: (resolve?, reject?) => FceuxModule;
  FS: any;
}\
""")

def write_api_md(f, functions, settings):
  # Prologue.
  f.write("""\
# em-fceux API

This file describes the `FceuxModule` interface functions (em-fceux API).

Code notations in this file follow TypeScript syntax.
Please see [index.d.ts](index.d.ts) for concrete declarations.
""")

  # Functions.
  for fn in functions:
    text = fn.lines[0] + '\n\n' + '\n'.join(fn.lines[1:])
    f.write(f'\n\n### `{fn.declaration}`\n\n{text}\n')

    if fn.name == 'setConfig':
      for s in settings:
        description = '  ' + '\n  '.join(s.lines)
        f.write(f'\n* `\'{s.name}\'`: `{s.type}`\n\n{description} Default: `{s.default}`.\n')

def parse_blocks(path):
  with open(path, 'rt') as f:
    block = None
    result = []
    for line in f.readlines():
      s = line.strip()
      if s.startswith('/*'):
        block = []
      elif s.startswith('*/'):
        result.append(block)
        block = None
      elif block != None:
        block.append(s)
    return result

def parse_function_block(block):
  declaration = block[0].split(' ', maxsplit=1)[1]
  lines = block[1:]
  return Meta(
    name=declaration.split(':')[0],
    declaration=declaration,
    lines=lines,
  )

def parse_setting_block(block):
  header = block[0].split(' ', maxsplit=3)
  lines = block[1:]
  return Meta(
    name=header[1],
    default=header[2],
    type=header[3],
    lines=lines,
  )

def parse_post_js(path):
  blocks = parse_blocks(path)
  functions = []
  settings = []
  for b in blocks:
    if b[0].startswith('@function'):
      functions.append(parse_function_block(b))
    elif b[0].startswith('@setting'):
      settings.append(parse_setting_block(b))
  return functions,settings

def main():
  functions,settings = parse_post_js('post.js')

  with open('index.d.ts', 'wt') as f:
    write_index_d_ts(f, functions, settings)

  with open('API.md', 'wt') as f:
    write_api_md(f, functions, settings)

if __name__ == '__main__':
  main()
