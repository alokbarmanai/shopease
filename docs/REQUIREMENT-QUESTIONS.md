# ShopEase – Requirement Questions Log

Questions raised during development/testing that the BRD (SE-BRD-001) does not answer clearly.
Each question needs a Product Owner decision. The BRD is updated once a decision is made.

| ID    | Raised By | Date       | BRD Ref | Question | Current Behaviour (assumption) | Status |
|-------|-----------|------------|---------|----------|--------------------------------|--------|
| RQ-01 | QA        | 2026-10-11 | RULE-06 | How is a percentage discount rounded? e.g. 10% of $49.99 = $4.999 | Rounded to nearest cent ($5.00) | Open |
| RQ-02 | QA        | 2026-10-11 | RULE-07 | Should an empty cart show a $5.00 shipping fee? | Shipping is $0.00 when cart is empty | Open |
| RQ-03 | QA        | 2026-10-11 | RULE-06, RULE-07 | A coupon can push the order below $50 and add $5 shipping, so the customer saves nothing (e.g. $54.49 cart + FLAT5 = $54.49). Is this acceptable? | Customer pays the same total; no warning shown | Open |
| RQ-04 | QA        | 2026-10-12 | BR-04, §7.1 | If items are removed and the subtotal falls below a coupon's minimum (e.g. FLAT5 needs $30), what happens to the applied coupon? | Coupon stays "applied" but gives $0.00 discount; no message to the customer. The coupon also stays on an empty cart. | Open |
| RQ-05 | QA        | 2026-10-12 | RULE-11 | Customers often type phone numbers with dashes or spaces (e.g. 512-555-0100). Should these be accepted (stripped) or rejected with a format hint? | Rejected with "Phone must be exactly 10 digits"; no hint shown before submitting | Open |
| RQ-06 | QA        | 2026-10-13 | RULE-02, BR-05 | When another customer buys the last items while they sit in a cart, checkout fails with "Only 0 left in stock for USB-C Hub". Should the wording be clearer (e.g. "USB-C Hub is no longer available in this quantity") and should the customer be guided to update the cart? | Message "Only 0 left in stock for <product>"; order rejected; cart kept unchanged | Open |

## Decisions
_(Record Product Owner decisions here with date.)_
