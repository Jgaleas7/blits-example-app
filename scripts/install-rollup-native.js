import { arch, platform } from 'node:process';
import { execSync } from 'node:child_process';

if (platform !== 'win32') {
  return;
}

const archMap = {
  x64: 'x64',
  ia32: 'ia32',
  arm64: 'arm64'
};

const mappedArch = archMap[arch];

if (!mappedArch) {
  console.warn(`Skipping rollup native install: unsupported Windows arch "${arch}".`);
  return;
}

const pkgName = `@rollup/rollup-win32-${mappedArch}-msvc@4.45.1`;

try {
  execSync(`npm install ${pkgName} --no-save --ignore-scripts`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.warn(`Warning: failed to install ${pkgName}.`, error);
}
