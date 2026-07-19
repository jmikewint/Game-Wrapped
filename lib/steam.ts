const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const CLAIMED_ID_PATTERN =
  /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

/**
 * Builds the URL that starts the Steam OpenID 2.0 handshake. Steam will
 * redirect the user back to `returnTo` with a set of `openid.*` query
 * params that must be verified before trusting them.
 */
export function getSteamAuthUrl(returnTo: string, realm: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

/**
 * Confirms the callback query params actually came from Steam (rather than
 * being spoofed by the client) by echoing them back to Steam with
 * `openid.mode=check_authentication`. Returns the verified SteamID64, or
 * null if verification fails.
 */
export async function verifySteamAssertion(
  query: URLSearchParams,
): Promise<string | null> {
  if (query.get("openid.mode") !== "id_res") return null;

  const verifyParams = new URLSearchParams(query);
  verifyParams.set("openid.mode", "check_authentication");

  const response = await fetch(STEAM_OPENID_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });

  if (!response.ok) return null;
  const body = await response.text();
  if (!body.includes("is_valid:true")) return null;

  const claimedId = query.get("openid.claimed_id");
  if (!claimedId) return null;

  const match = claimedId.match(CLAIMED_ID_PATTERN);
  return match ? match[1] : null;
}

export type SteamProfile = {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
};

/**
 * Looks up a player's public profile via the Steam Web API. Requires a
 * STEAM_API_KEY (get one at https://steamcommunity.com/dev/apikey).
 */
export async function fetchSteamProfile(
  steamId: string,
): Promise<SteamProfile | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new Error(
      "STEAM_API_KEY is not set. Get one at https://steamcommunity.com/dev/apikey and add it to your .env file.",
    );
  }

  const url = new URL(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamId);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = await response.json();
  const player = data?.response?.players?.[0];
  if (!player) return null;

  return {
    steamId,
    displayName: player.personaname,
    avatarUrl: player.avatarfull,
    profileUrl: player.profileurl,
  };
}
