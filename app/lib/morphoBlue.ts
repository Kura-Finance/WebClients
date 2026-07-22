/**
 * Morpho Blue on Base — borrow / repay / withdraw collateral builders.
 */

import {
  encodeFunctionData,
  erc20Abi,
  getAddress,
  isAddress,
  maxUint256,
  parseUnits,
} from "viem";
import { basePublicClient } from "@/lib/baseChain";
import type { MorphoMarket } from "@/lib/morphoApi";
import type { Call } from "@/lib/smartAccountSend";

export const MORPHO_BLUE_ADDRESS =
  "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as const;

const morphoBlueAbi = [
  {
    type: "function",
    name: "supplyCollateral",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "irm", type: "address" },
          { name: "lltv", type: "uint256" },
        ],
      },
      { name: "assets", type: "uint256" },
      { name: "onBehalf", type: "address" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "irm", type: "address" },
          { name: "lltv", type: "uint256" },
        ],
      },
      { name: "assets", type: "uint256" },
      { name: "shares", type: "uint256" },
      { name: "onBehalf", type: "address" },
      { name: "receiver", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "repay",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "irm", type: "address" },
          { name: "lltv", type: "uint256" },
        ],
      },
      { name: "assets", type: "uint256" },
      { name: "shares", type: "uint256" },
      { name: "onBehalf", type: "address" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawCollateral",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "irm", type: "address" },
          { name: "lltv", type: "uint256" },
        ],
      },
      { name: "assets", type: "uint256" },
      { name: "onBehalf", type: "address" },
      { name: "receiver", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "market",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "totalSupplyAssets", type: "uint128" },
          { name: "totalSupplyShares", type: "uint128" },
          { name: "totalBorrowAssets", type: "uint128" },
          { name: "totalBorrowShares", type: "uint128" },
          { name: "lastUpdate", type: "uint128" },
          { name: "fee", type: "uint128" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "position",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "user", type: "address" },
    ],
    outputs: [
      { name: "supplyShares", type: "uint256" },
      { name: "borrowShares", type: "uint128" },
      { name: "collateral", type: "uint128" },
    ],
  },
] as const;

export interface MorphoMarketParams {
  marketId: `0x${string}`;
  loanToken: `0x${string}`;
  collateralToken: `0x${string}`;
  oracle: `0x${string}`;
  irm: `0x${string}`;
  lltv: bigint;
  loanDecimals: number;
  collateralDecimals: number;
}

function amountToRaw(amount: number, decimals: number): bigint {
  const raw = amount.toString();
  const [whole, frac = ""] = raw.split(".");
  const safe = frac ? `${whole}.${frac.slice(0, decimals)}` : whole;
  return parseUnits(safe as `${number}`, decimals);
}

function requireAddress(value: string, label: string): `0x${string}` {
  if (!isAddress(value)) throw new Error(`${label} is missing or invalid.`);
  return getAddress(value);
}

export function toMorphoMarketParams(market: MorphoMarket): MorphoMarketParams {
  if (!market.oracleAddress || !market.irmAddress) {
    throw new Error("Market is missing oracle or IRM configuration.");
  }
  return {
    marketId: market.marketId as `0x${string}`,
    loanToken: requireAddress(market.loanAsset.address, "Loan token"),
    collateralToken: requireAddress(market.collateralAsset.address, "Collateral token"),
    oracle: requireAddress(market.oracleAddress, "Oracle"),
    irm: requireAddress(market.irmAddress, "IRM"),
    lltv: BigInt(market.lltv),
    loanDecimals: market.loanAsset.decimals,
    collateralDecimals: market.collateralAsset.decimals,
  };
}

function marketParamsTuple(market: MorphoMarketParams) {
  return {
    loanToken: market.loanToken,
    collateralToken: market.collateralToken,
    oracle: market.oracle,
    irm: market.irm,
    lltv: market.lltv,
  } as const;
}

async function appendApprovalIfNeeded(params: {
  calls: Call[];
  token: `0x${string}`;
  owner: `0x${string}`;
  spender: `0x${string}`;
  required: bigint;
}): Promise<void> {
  if (params.required <= BigInt(0)) return;
  const allowance = (await basePublicClient.readContract({
    address: params.token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [params.owner, params.spender],
  })) as bigint;
  if (allowance < params.required) {
    params.calls.push({
      to: params.token,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [params.spender, maxUint256],
      }),
    });
  }
}

function sharesToAssetsUp(shares: bigint, totalAssets: bigint, totalShares: bigint): bigint {
  if (shares <= BigInt(0) || totalShares <= BigInt(0)) return BigInt(0);
  return (shares * totalAssets + totalShares - BigInt(1)) / totalShares;
}

export async function readMorphoPosition(
  market: MorphoMarketParams,
  user: `0x${string}`,
): Promise<{ collateralRaw: bigint; borrowShares: bigint; collateralFormatted: number }> {
  const result = (await basePublicClient.readContract({
    address: MORPHO_BLUE_ADDRESS,
    abi: morphoBlueAbi,
    functionName: "position",
    args: [market.marketId, user],
  })) as readonly [bigint, bigint, bigint];

  return {
    collateralRaw: result[2],
    borrowShares: result[1],
    collateralFormatted: Number(result[2]) / 10 ** market.collateralDecimals,
  };
}

const morphoOracleAbi = [
  {
    type: "function",
    name: "price",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const ORACLE_PRICE_SCALE = BigInt(10) ** BigInt(36);

export async function readMorphoUserPositionDisplay(
  market: MorphoMarketParams,
  user: `0x${string}`,
): Promise<{
  borrowAssetsUsd: number;
  collateralUsd: number;
  collateralFormatted: number;
  hasDebt: boolean;
}> {
  const position = await readMorphoPosition(market, user);
  let borrowAssetsRaw = BigInt(0);
  if (position.borrowShares > BigInt(0)) {
    const totals = (await basePublicClient.readContract({
      address: MORPHO_BLUE_ADDRESS,
      abi: morphoBlueAbi,
      functionName: "market",
      args: [market.marketId],
    })) as { totalBorrowAssets: bigint; totalBorrowShares: bigint };
    borrowAssetsRaw = sharesToAssetsUp(
      position.borrowShares,
      BigInt(totals.totalBorrowAssets),
      BigInt(totals.totalBorrowShares),
    );
  }

  let oraclePrice = BigInt(0);
  try {
    oraclePrice = (await basePublicClient.readContract({
      address: market.oracle,
      abi: morphoOracleAbi,
      functionName: "price",
    })) as bigint;
  } catch {
    oraclePrice = BigInt(0);
  }

  const collateralValueLoanRaw =
    position.collateralRaw > BigInt(0) && oraclePrice > BigInt(0)
      ? (position.collateralRaw * oraclePrice) / ORACLE_PRICE_SCALE
      : BigInt(0);

  return {
    borrowAssetsUsd: Number(borrowAssetsRaw) / 10 ** market.loanDecimals,
    collateralUsd: Number(collateralValueLoanRaw) / 10 ** market.loanDecimals,
    collateralFormatted: position.collateralFormatted,
    hasDebt: position.borrowShares > BigInt(0),
  };
}

export async function buildMorphoBorrowCalls(params: {
  market: MorphoMarket;
  collateralAmount: number;
  borrowAmount: number;
  onBehalf: `0x${string}`;
}): Promise<Call[]> {
  const market = toMorphoMarketParams(params.market);
  const collateralRaw = amountToRaw(params.collateralAmount, market.collateralDecimals);
  const borrowRaw = amountToRaw(params.borrowAmount, market.loanDecimals);
  if (collateralRaw <= BigInt(0) && borrowRaw <= BigInt(0)) {
    throw new Error("Borrow or collateral amount must be greater than 0.");
  }

  const tuple = marketParamsTuple(market);
  const calls: Call[] = [];

  if (collateralRaw > BigInt(0)) {
    await appendApprovalIfNeeded({
      calls,
      token: market.collateralToken,
      owner: params.onBehalf,
      spender: MORPHO_BLUE_ADDRESS,
      required: collateralRaw,
    });
    calls.push({
      to: MORPHO_BLUE_ADDRESS,
      data: encodeFunctionData({
        abi: morphoBlueAbi,
        functionName: "supplyCollateral",
        args: [tuple, collateralRaw, params.onBehalf, "0x"],
      }),
    });
  }

  if (borrowRaw > BigInt(0)) {
    if (collateralRaw <= BigInt(0)) {
      const position = await readMorphoPosition(market, params.onBehalf);
      if (position.collateralRaw <= BigInt(0)) {
        throw new Error("Collateral amount must be greater than 0.");
      }
    }
    calls.push({
      to: MORPHO_BLUE_ADDRESS,
      data: encodeFunctionData({
        abi: morphoBlueAbi,
        functionName: "borrow",
        args: [tuple, borrowRaw, BigInt(0), params.onBehalf, params.onBehalf],
      }),
    });
  }

  return calls;
}

export async function buildMorphoRepayCalls(params: {
  market: MorphoMarket;
  onBehalf: `0x${string}`;
  repayAmount?: number;
  repayAll?: boolean;
}): Promise<Call[]> {
  const market = toMorphoMarketParams(params.market);
  const position = await readMorphoPosition(market, params.onBehalf);
  if (position.borrowShares <= BigInt(0)) throw new Error("No outstanding debt.");

  const tuple = marketParamsTuple(market);
  const calls: Call[] = [];

  if (params.repayAll) {
    const totals = (await basePublicClient.readContract({
      address: MORPHO_BLUE_ADDRESS,
      abi: morphoBlueAbi,
      functionName: "market",
      args: [market.marketId],
    })) as { totalBorrowAssets: bigint; totalBorrowShares: bigint };
    const repayRaw = sharesToAssetsUp(
      position.borrowShares,
      BigInt(totals.totalBorrowAssets),
      BigInt(totals.totalBorrowShares),
    );
    await appendApprovalIfNeeded({
      calls,
      token: market.loanToken,
      owner: params.onBehalf,
      spender: MORPHO_BLUE_ADDRESS,
      required: repayRaw + BigInt(1000),
    });
    calls.push({
      to: MORPHO_BLUE_ADDRESS,
      data: encodeFunctionData({
        abi: morphoBlueAbi,
        functionName: "repay",
        args: [tuple, BigInt(0), position.borrowShares, params.onBehalf, "0x"],
      }),
    });
    return calls;
  }

  const repayRaw = amountToRaw(params.repayAmount ?? 0, market.loanDecimals);
  if (repayRaw <= BigInt(0)) throw new Error("Repay amount must be greater than 0.");
  await appendApprovalIfNeeded({
    calls,
    token: market.loanToken,
    owner: params.onBehalf,
    spender: MORPHO_BLUE_ADDRESS,
    required: repayRaw,
  });
  calls.push({
    to: MORPHO_BLUE_ADDRESS,
    data: encodeFunctionData({
      abi: morphoBlueAbi,
      functionName: "repay",
      args: [tuple, repayRaw, BigInt(0), params.onBehalf, "0x"],
    }),
  });
  return calls;
}
