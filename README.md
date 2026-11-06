# Stock & Sense

An English-language discussion prototype for an inventory decision service for multi-store SME jewellers.

Live demo: https://kenny149151.github.io/jewellery-inventory-pilot/

## What works

- Two-selection capture of an unmet gold-necklace request, with store and demo date.
- Transparent, deterministic transfer, replenishment, slow-stock and affordability review candidates.
- Adjustable analysis window and source reserve, evidence and review checks.
- Approval / deferral and an execution log. These do not issue orders or change inventory.
- Separate provider / client and setup / recurring time logs.
- Editable, explicitly hypothetical service-economics scenario.
- Local CSV import validation, CSV downloads and session JSON export.
- Mapping to the mentor's entrepreneurship canvas, AI layers and enterprise architecture.

## Run

Use a static web server from this directory, for example `python3 -m http.server 8765`, then open `http://localhost:8765`.

Run the decision and import checks with `node --test engine.test.mjs`.

## Data and limitations

All built-in stores, prices, quantities, inquiries and transactions are synthetic. The fixed demonstration date is 2026-11-06 and the example currency is CNY. This is not a company data extract or a claim of measured business improvement.

This is a browser-only prototype with localStorage, no backend or live AI model. Changes are specific to the browser / origin, not shared between devices. A production service would require access control, agreed data handling, adapters, monitoring, historical snapshots and independent validation.

CSV templates are a small, documented demo schema, not a promise to accept arbitrary POS exports. Sales imports contain positive completed sales, not returns. Inventory imports are one current row per store / SKU, including zero-stock rows. Multi-lot inventory and returns need production adapters and agreed accounting definitions. Imports replace a dataset after validation and preserve existing transaction IDs within that dataset.

The demo's latest inventory catalog supplies SKU weight classification. It does not reconstruct stock availability or use machine learning to forecast demand. Source reserve limits are shared demo assumptions. A proposal to transfer one item needs manager review. Inquiry matching at a weight or budget band is not an exact style match, confirmed sale or lost-revenue estimate. Source receipt age is not a sell-through cohort result. Replenishment quantities are intentionally not calculated without lead times, incoming orders and approved stock limits.

An execution log records a user assertion. Import a later inventory snapshot to reflect actual stock changes. Company cash is not released simply by moving stock between branches. Pilot metrics remain unmeasured until actual follow-up data are collected.

## Proposed pilot

Two internal stores, gold necklaces, eight weeks and at least two replenishment cycles. Compare equal observation windows and include availability / missed-demand checks. Separate onboarding time from recurring provider effort and customer burden. External willingness to pay requires a separate paid pilot.

## References

- Mentor-supplied three-page *Business Fundamentals and AI Architecture* document. The original document and private company data are not distributed here.
- [World Gold Council, 2025 Chinese jewellery retailer insights](https://www.gold.org/goldhub/research/2025-chinese-jewellery-retailer-insights-gold-and-self-wear-remain-key)
- [Anthropic, Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Jewel360, Inventory management](https://jewel360.com/inventory-management)
