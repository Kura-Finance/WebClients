/**
 * Shared Morpho Earn / Borrow position loaders (Home summary + Treasury holdings).
 */

import {
  collateralDisplayName,
  listBorrowMorphoMarkets,
  listEarnMorphoVaults,
  pickMarketsByCollateral,
  type MorphoMarket,
  type MorphoVault,
} from "@/lib/morphoApi";
import {
  readVaultPosition,
  resolveDepositVault,
} from "@/lib/morphoEarn";
import {
  readMorphoUserPositionDisplay,
  toMorphoMarketParams,
} from "@/lib/morphoBlue";

export interface MorphoEarnPosition {
  vault: MorphoVault;
  assetsFormatted: number;
  amountUsd: number;
}

export interface MorphoBorrowPosition {
  market: MorphoMarket;
  borrowAssetsUsd: number;
  collateralUsd: number;
  collateralFormatted: number;
}

function earnPositionUsd(vault: MorphoVault, assetsFormatted: number): number {
  if (assetsFormatted <= 0) return 0;
  const px = vault.sharePriceUsd > 0 ? vault.sharePriceUsd : 1;
  if (vault.assetSymbol.toUpperCase().includes("USD")) return assetsFormatted;
  return assetsFormatted * px;
}

export async function listEarnPositions(
  sca: `0x${string}`,
): Promise<MorphoEarnPosition[]> {
  const vaults = await listEarnMorphoVaults();
  const rows = await Promise.all(
    vaults.map(async (vault): Promise<MorphoEarnPosition | null> => {
      try {
        const { depositAddress } = resolveDepositVault(vault.address);
        const pos = await readVaultPosition(
          depositAddress,
          sca,
          vault.assetDecimals || 6,
        );
        const amountUsd = earnPositionUsd(vault, pos.assetsFormatted);
        if (amountUsd < 0.01) return null;
        return { vault, assetsFormatted: pos.assetsFormatted, amountUsd };
      } catch {
        return null;
      }
    }),
  );
  return rows
    .filter((r): r is MorphoEarnPosition => r != null)
    .sort((a, b) => b.amountUsd - a.amountUsd);
}

export async function sumEarnPositionsUsd(sca: `0x${string}`): Promise<number> {
  const rows = await listEarnPositions(sca);
  return rows.reduce((s, r) => s + r.amountUsd, 0);
}

export async function listBorrowPositions(
  sca: `0x${string}`,
): Promise<MorphoBorrowPosition[]> {
  const markets = pickMarketsByCollateral(await listBorrowMorphoMarkets());
  const rows = await Promise.all(
    markets.map(async (market): Promise<MorphoBorrowPosition | null> => {
      try {
        if (!market.oracleAddress || !market.irmAddress) return null;
        const display = await readMorphoUserPositionDisplay(
          toMorphoMarketParams(market),
          sca,
        );
        if (display.borrowAssetsUsd < 0.01 && display.collateralFormatted <= 0) {
          return null;
        }
        if (display.borrowAssetsUsd < 0.01) return null;
        return {
          market,
          borrowAssetsUsd: display.borrowAssetsUsd,
          collateralUsd: display.collateralUsd,
          collateralFormatted: display.collateralFormatted,
        };
      } catch {
        return null;
      }
    }),
  );
  return rows
    .filter((r): r is MorphoBorrowPosition => r != null)
    .sort((a, b) => b.borrowAssetsUsd - a.borrowAssetsUsd);
}

export async function sumBorrowDebtsUsd(sca: `0x${string}`): Promise<number> {
  const rows = await listBorrowPositions(sca);
  return rows.reduce((s, r) => s + r.borrowAssetsUsd, 0);
}

export function borrowPositionLabel(market: MorphoMarket): string {
  return `${collateralDisplayName(market.collateralAsset.symbol)} loan`;
}
