export const ADMIN_GATEWAY_SECRET_HEADER = "x-rise-admin-gateway-secret";
export const MIN_ADMIN_GATEWAY_SECRET_LENGTH = 32;

export type AdminIdentity = {
  email: string;
  displayName: string;
};

export type AdminAuthConfig = {
  adminEmails: ReadonlySet<string>;
  gatewaySecret?: string;
  trustedHeaderAuth?: boolean;
};

export function getAdminAuthConfigurationError(config: AdminAuthConfig): string | null {
  if (config.gatewaySecret) {
    return config.gatewaySecret.length >= MIN_ADMIN_GATEWAY_SECRET_LENGTH
      ? null
      : `ADMIN_GATEWAY_SECRET deve ter ao menos ${MIN_ADMIN_GATEWAY_SECRET_LENGTH} caracteres.`;
  }
  if (config.trustedHeaderAuth) return null;
  return "Configure ADMIN_GATEWAY_SECRET ou habilite explicitamente ADMIN_TRUSTED_HEADER_AUTH=true.";
}

function secretsMatch(actual: string, expected: string) {
  let difference = actual.length ^ expected.length;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= (actual.charCodeAt(index) || 0) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

export function getConfiguredAdminIdentity(
  requestHeaders: Pick<Headers, "get">,
  config: AdminAuthConfig,
): AdminIdentity | null {
  const gatewaySecret = config.gatewaySecret ?? "";
  if (getAdminAuthConfigurationError(config)) return null;
  if (gatewaySecret) {
    const suppliedGatewaySecret = requestHeaders.get(ADMIN_GATEWAY_SECRET_HEADER) ?? "";
    if (!secretsMatch(suppliedGatewaySecret, gatewaySecret)) return null;
  }

  const email = requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email || !config.adminEmails.has(email)) return null;

  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  let displayName = email;
  if (encodedName && requestHeaders.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try {
      displayName = decodeURIComponent(encodedName);
    } catch {
      displayName = email;
    }
  }
  return { email, displayName };
}
