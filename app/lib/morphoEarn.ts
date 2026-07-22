/**
 * Morpho Earn — ERC-4626 deposit/withdraw builders + fee-wrapper routing.
 */

import { encodeFunctionData, erc20Abi, erc4626Abi, maxUint256, parseUnits } from "viem";
import { basePublicClient } from "@/lib/baseChain";
import { EARN_VAULT_ALLOWLIST } from "@/lib/morphoApi";
import type { Call } from "@/lib/smartAccountSend";

/** Inner Morpho vault → Kura fee-wrapper (same order as EARN_VAULT_ALLOWLIST / mobile). */
const FEE_WRAPPERS = [
  "0x0F457aa0AfD3D208cbfEE520804118f88965a529",
  "0x6D10990b11f88EE40e4ABc2f8CbE1f7194190Db0",
  "0x50e8B8B50037322BE0Efc2048d66Cb957f349816",
  "0x07540AeeD4B12408c87365417aE7CE59A966CA47",
] as const;

const FEE_WRAPPER_MAP: Record<string, `0x${string}`> = Object.fromEntries(
  EARN_VAULT_ALLOWLIST.map((vault, i) => [vault.toLowerCase(), FEE_WRAPPERS[i]]),
) as Record<string, `0x${string}`>;

export function resolveDepositVault(innerVaultAddress: string): {
  depositAddress: `0x${string}`;
  usesFeeWrapper: boolean;
} {
  const key = innerVaultAddress.toLowerCase();
  const wrapper = FEE_WRAPPER_MAP[key];
  if (wrapper) return { depositAddress: wrapper, usesFeeWrapper: true };
  return { depositAddress: innerVaultAddress as `0x${string}`, usesFeeWrapper: false };
}

function amountToRaw(amount: number, decimals: number): bigint {
  const raw = amount.toString();
  const [whole, frac = ""] = raw.split(".");
  const safe = frac ? `${whole}.${frac.slice(0, decimals)}` : whole;
  return parseUnits(safe as `${number}`, decimals);
}

export async function readVaultPosition(
  vaultAddress: `0x${string}`,
  owner: `0x${string}`,
  assetDecimals: number,
): Promise<{ shares: bigint; assets: bigint; assetsFormatted: number }> {
  const shares = (await basePublicClient.readContract({
    address: vaultAddress,
    abi: erc4626Abi,
    functionName: "balanceOf",
    args: [owner],
  })) as bigint;

  if (shares <= BigInt(0)) return { shares: BigInt(0), assets: BigInt(0), assetsFormatted: 0 };

  const assets = (await basePublicClient.readContract({
    address: vaultAddress,
    abi: erc4626Abi,
    functionName: "convertToAssets",
    args: [shares],
  })) as bigint;

  return {
    shares,
    assets,
    assetsFormatted: Number(assets) / 10 ** assetDecimals,
  };
}

export async function readErc20Balance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
  decimals: number,
): Promise<number> {
  const raw = (await basePublicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  })) as bigint;
  return Number(raw) / 10 ** decimals;
}

export async function buildMorphoDepositCalls(params: {
  innerVaultAddress: string;
  assetAddress: `0x${string}`;
  assetDecimals: number;
  amount: number;
  receiver: `0x${string}`;
}): Promise<Call[]> {
  const { depositAddress } = resolveDepositVault(params.innerVaultAddress);
  const assetsRaw = amountToRaw(params.amount, params.assetDecimals);
  if (assetsRaw <= BigInt(0)) throw new Error("Amount must be greater than 0.");

  const calls: Call[] = [];
  const allowance = (await basePublicClient.readContract({
    address: params.assetAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [params.receiver, depositAddress],
  })) as bigint;

  if (allowance < assetsRaw) {
    calls.push({
      to: params.assetAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [depositAddress, maxUint256],
      }),
    });
  }

  calls.push({
    to: depositAddress,
    data: encodeFunctionData({
      abi: erc4626Abi,
      functionName: "deposit",
      args: [assetsRaw, params.receiver],
    }),
  });

  return calls;
}

export async function buildMorphoWithdrawCalls(params: {
  innerVaultAddress: string;
  assetDecimals: number;
  owner: `0x${string}`;
  amountAssets: number;
  withdrawAll?: boolean;
}): Promise<Call[]> {
  const { depositAddress } = resolveDepositVault(params.innerVaultAddress);
  const position = await readVaultPosition(
    depositAddress,
    params.owner,
    params.assetDecimals,
  );
  if (position.shares <= BigInt(0)) throw new Error("No vault shares to withdraw.");

  let shares = position.shares;
  if (!params.withdrawAll) {
    if (!(params.amountAssets > 0)) throw new Error("Amount must be greater than 0.");
    const targetRaw = amountToRaw(params.amountAssets, params.assetDecimals);
    if (targetRaw > position.assets) throw new Error("Amount exceeds vault balance.");
    shares = (await basePublicClient.readContract({
      address: depositAddress,
      abi: erc4626Abi,
      functionName: "convertToShares",
      args: [targetRaw],
    })) as bigint;
    if (shares > position.shares) shares = position.shares;
  }

  return [
    {
      to: depositAddress,
      data: encodeFunctionData({
        abi: erc4626Abi,
        functionName: "redeem",
        args: [shares, params.owner, params.owner],
      }),
    },
  ];
}
