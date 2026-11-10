import { checkBundleBudget } from "../../../../scripts/check-bundle.mjs";

export async function runBundleCheck(context) {
  const findings = await checkBundleBudget({
    targetDir: context.targetDir,
    maxRouteJsKb: Number(context.config.max_route_js_kb ?? 250),
    maxTotalJsKb: Number(context.config.max_total_js_kb ?? 800),
    maxRegressionPct: Number(context.config.max_regression_pct ?? 10)
  });
  return { findings };
}

