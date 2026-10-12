Coupons (BR-04), part 2: 🎯 you design the tests

Until now I mostly wrote the test cases. This time you design them, the way a QA engineer does after reading the requirements. Don’t run anything yet. First you’ll write the test cases, I’ll review your design (real teams call this a test case review), and then you’ll execute.

📚 What you have to work with

Rules

Rule	Meaning
RULE-04	Only ONE coupon per order
RULE-05	Codes are NOT case-sensitive
RULE-06/07	Discount on subtotal; free shipping if (subtotal − discount) ≥ $50
BR-04	Invalid or expired coupon shows an error; the customer can remove a coupon

Coupons (BRD §7.1)

Code	Benefit	Condition	Status
SAVE10	10% off	none	Active
FLAT5	$5.00 off	subtotal ≥ $30	Active
EXPIRED20	20% off	–	Expired

The order of checks in the code (the first failing check decides the message):

1. Cart is empty?                → 400 "Cart is empty"
2. Coupon already applied?       → 400 "Only one coupon can be applied per order"
3. Code doesn't exist?           → 400 "Invalid coupon code"
4. Coupon expired?               → 400 "This coupon has expired"
5. Subtotal below minimum?       → 400 "This coupon requires a subtotal of at least $30.00"
6. Otherwise                     → 200, coupon applied

Products you can use to build a cart: see BRD §8 (Mouse $19.99, Keyboard $49.99, USB-C Hub $29.99, Laptop Stand $34.50, Headphones $89.00).

✍️ Your task: design 8 to 10 test cases

Use this template:

ID	Precondition (what’s in the cart? any coupon?)	Request	Expected (status · message or key values)
CP-01			
CP-02			
…			
Hints: try to cover each category
✅ Positive: each valid coupon working
❌ Negative: one test per error message in the check list above (there are 5)
🔠 RULE-05: what kind of input checks “not case-sensitive”?
🔁 RULE-04: what’s the precondition for testing “one coupon only”?
🗑️ Remove: after removing, what should the totals return to?
📏 Boundary: FLAT5 needs $30 or more. Look at the product prices. Which product sits just below $30? Can you build a cart of exactly $30.00 with these products? (Think about what that means for testing.)
💸 RQ-03: can you design a test that shows the “customer saves nothing” problem through the API?
⚠️ Remember the lessons from earlier rounds
Expected results come from the rules, not from intuition
Expected = status + message (or the key values for a success)
Every test needs a clear precondition
✅ Your checkpoint

Send me your test case table, without running anything yet. I’ll review it like a QA lead: what’s strong, what’s missing, and what’s ambiguous. Then you’ll execute it.

Take your time. This is the most important skill in the whole bootcamp. 🧠