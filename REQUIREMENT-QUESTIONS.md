# ShopEase – Requirement Questions Log

Questions raised during development/testing that the BRD (SE-BRD-001) does not answer clearly.
Each question needs a Product Owner decision. The BRD is updated once a decision is made.

| ID    | Raised By | Date       | BRD Ref | Question | Current Behaviour (assumption) | Status |
|-------|-----------|------------|---------|----------|--------------------------------|--------|
| RQ-01 | QA        | 2026-10-11 | RULE-06 | How is a percentage discount rounded? e.g. 10% of $49.99 = $4.999 | Rounded to nearest cent ($5.00) | Open |
| RQ-02 | QA        | 2026-10-11 | RULE-07 | Should an empty cart show a $5.00 shipping fee? | Shipping is $0.00 when cart is empty | Open |
| RQ-03 | QA        | 2026-10-11 | RULE-06, RULE-07 | A coupon can push the order below $50 and add $5 shipping, so the customer saves nothing (e.g. $54.49 cart + FLAT5 = $54.49). Is this acceptable? | Customer pays the same total; no warning shown | Open |

## Decisions
_(Record Product Owner decisions here with date.)_