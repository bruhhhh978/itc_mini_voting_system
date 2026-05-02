export function getPocPackageId(): string | null {
  const v = import.meta.env.VITE_POC_PACKAGE_ID as string | undefined;
  return v && v.trim().length > 0 ? v.trim() : null;
}

/** Shared `POCRegistry` object id (created by `poc::init` on publish). */
export function getPocRegistryId(): string | null {
  const v = import.meta.env.VITE_POC_REGISTRY_ID as string | undefined;
  return v && v.trim().length > 0 ? v.trim() : null;
}

export function pocStructType(structName: 'POCRegistry' | 'Profile' | 'Task' | 'Contribution'): string | null {
  const pkg = getPocPackageId();
  if (!pkg) return null;
  return `${pkg}::poc::${structName}`;
}
