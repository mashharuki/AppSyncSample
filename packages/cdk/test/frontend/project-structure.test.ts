import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Frontend Project Structure', () => {
  const frontendDir = join(__dirname, '../../../frontend');

  it('should have a frontend directory', () => {
    expect(existsSync(frontendDir)).toBe(true);
  });

  it('should have a package.json with correct configuration', () => {
    const packageJsonPath = join(frontendDir, 'package.json');
    expect(existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.name).toBe('frontend');
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('preview');
  });

  it('should have a tsconfig.json extending root config', () => {
    const tsconfigPath = join(frontendDir, 'tsconfig.json');
    expect(existsSync(tsconfigPath)).toBe(true);

    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfig.extends).toBe('../../tsconfig.json');
  });

  it('should have a vite.config.ts configured for port 3000', () => {
    const viteConfigPath = join(frontendDir, 'vite.config.ts');
    expect(existsSync(viteConfigPath)).toBe(true);

    const viteConfig = readFileSync(viteConfigPath, 'utf-8');
    expect(viteConfig).toContain('port: 3000');
  });

  it('should have a src directory with main.tsx', () => {
    const mainTsxPath = join(frontendDir, 'src/main.tsx');
    expect(existsSync(mainTsxPath)).toBe(true);
  });

  it('should have a public directory', () => {
    const publicDir = join(frontendDir, 'public');
    expect(existsSync(publicDir)).toBe(true);
  });

  it('should have index.html at the root', () => {
    const indexHtmlPath = join(frontendDir, 'index.html');
    expect(existsSync(indexHtmlPath)).toBe(true);
  });
});
