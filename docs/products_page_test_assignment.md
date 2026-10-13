# Assignment: Login & Products Pages – End-User Test (Browser)

| Item    | Detail                                        |
|---------|-----------------------------------------------|
| Feature | Login page, Products page, Header             |
| BRD Ref | BR-01, BR-02, BR-03 · RULE-01 to RULE-03 · RULE-09 · NFR-03 |
| Tool    | Browser (Chrome/Edge) + Thunder Client for reset |
| Status  | To Do                                         |

---

## 1. Goal
Test the Login and Products pages **as a real customer** – no API tools,
except one reset call at the start.

## 2. Before You Start
1. Terminal in `shopease-app`: `npm run dev`
2. Wait for: `ShopEase running at http://localhost:3000`
3. Thunder Client: **POST** `http://localhost:3000/api/test/reset` → expect **200**
4. In the browser, open `http://localhost:3000/`
   - If you were logged in before, you are sent to the login page automatically
     (reset cleared all sessions – this is expected).

> Do NOT save any code file during the test – it restarts the server and logs you out.

---

## 3. Login Page Tests

| ID   | What to do                                     | Expected |
|------|------------------------------------------------|----------|
| L-01 | Open `http://localhost:3000/`                  | Login card with **Username \***, **Password \*** (red asterisks) and a Login button |
| L-02 | Click **Login** with both fields empty         | Red box: **Username and password are required** |
| L-03 | `alice` / `wrong123` → Login                   | Red box: **Invalid username or password** |
| L-04 | `locked_user` / `Shop@123` → Login             | Red box: **Your account is locked. Please contact support** |
| L-05 | Type in the Password field                     | Dots shown, not letters (NFR-03) |
| L-06 | `alice` / `Shop@123` → Login                   | Products page opens (`/products.html`) |

## 4. Products Page Tests (logged in as alice)

| ID    | What to do                                              | Expected |
|-------|---------------------------------------------------------|----------|
| PR-01 | Look at the header                                      | ShopEase logo · Products · My Orders · Cart badge **0** · *Hi, Alice Johnson* · Logout |
| PR-02 | Look at the product cards                               | **6 cards**; prices $19.99, $49.99, $29.99, $34.50, $89.00, $39.99 |
| PR-03 | Look at the HD Webcam card                              | Red **Out of Stock**; Add to Cart button greyed out and not clickable |
| PR-04 | Type `mouse` in search                                  | Only **Wireless Mouse** |
| PR-05 | Clear search, choose category **Audio**                 | Only **Noise-Cancelling Headphones** |
| PR-06 | Choose **All categories**, type `xyz`                   | No cards; text *No products found.* |
| PR-07 | Clear search, click **Add to Cart** on Wireless Mouse   | Green *Wireless Mouse added to cart*; badge **1** |
| PR-08 | Click Add to Cart on Wireless Mouse again               | Badge **2** |
| PR-09 | Click Add to Cart on **USB-C Hub** 3 times              | 1st & 2nd green (badge 3, then 4); **3rd** red *Only 2 left in stock*; badge stays **4** |
| PR-10 | Click **Logout**                                        | Login page; DevTools → Application → Local Storage is empty |
| PR-11 | Type `http://localhost:3000/products.html` in address bar | Sent back to the login page |

> Clicking **Cart** or **My Orders** may show `Cannot GET ...` if those pages
> are not built yet – that is expected, not a defect.

## 5. Extra: Watch the Network Tab (learning)
1. Log in, press **F12** → **Network** tab
2. Type `mouse` slowly in the search box
3. Observe: one `products?search=...` request per keystroke (5 requests)

---

## 6. Test Execution Report (fill in)

| ID    | Expected (short)                          | Actual | Pass/Fail |
|-------|-------------------------------------------|--------|-----------|
| L-01  | Login card with required markers          |        |           |
| L-02  | Username and password are required        |        |           |
| L-03  | Invalid username or password              |        |           |
| L-04  | Your account is locked…                   |        |           |
| L-05  | Password shown as dots                    |        |           |
| L-06  | Products page opens                       |        |           |
| PR-01 | Header correct, badge 0                   |        |           |
| PR-02 | 6 cards, correct prices                   |        |           |
| PR-03 | Webcam Out of Stock, button disabled      |        |           |
| PR-04 | Search mouse → 1 card                     |        |           |
| PR-05 | Audio → 1 card                            |        |           |
| PR-06 | xyz → No products found.                  |        |           |
| PR-07 | Added message, badge 1                    |        |           |
| PR-08 | Badge 2                                   |        |           |
| PR-09 | 3rd add → Only 2 left in stock, badge 4   |        |           |
| PR-10 | Logout → login page, storage empty        |        |           |
| PR-11 | Direct URL → login page                   |        |           |

## 7. Rules for Recording Results
- Copy messages exactly as shown on screen
- Result column = **Pass** or **Fail** only
- If something fails: try once more, then take a screenshot
- Note anything that looks odd, even if no test covers it
  (like the missing required marker found on the login page)