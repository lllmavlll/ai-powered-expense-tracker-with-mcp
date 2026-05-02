# Expense Tracker — Optimization & Roadmap Ideas

A working list of UI/UX improvements and feature ideas for the Expense Tracker app. Loosely ordered: cheap-and-fast at the top, larger bets toward the bottom. Anything tagged **[AI]** becomes especially valuable once the MCP server is wired up.

---

## 1. UI / UX optimizations

### Quick wins (1–2 hours each)

- **Skeleton loaders.** Dashboard cards and the expenses table flash empty before data arrives. Add shimmer skeletons matching the final layout to prevent layout shift and feel snappier.
- **Toasts on mutations.** Add/edit/delete currently has no feedback. Wire up Sonner (or shadcn's toast) and emit on every API success/failure.
- **Optimistic updates.** Push the new/edited/deleted row into local state immediately, roll back on error. Pairs with the toast above.
- **Better empty states.** "No expenses found" should include a primary action — `[+ Add your first expense]` — instead of just text.
- **Centralize formatting.** `₹${n.toLocaleString()}` is duplicated across ~6 files. Move to `lib/format.ts` (`formatCurrency`, `formatDate`) so the Settings → Currency / Date Format actually drives display.
- **Persist filters in the URL.** `?q=coffee&cat=Food` survives back/forward and is shareable. Use `useSearchParams` + a small debounce.
- **Theme toggle in the chrome.** Today it lives buried in Settings. Add a sun/moon button in the sidebar footer (or topbar on mobile) for one-click toggling.
- **A11y polish.**
  - Focus-trap inside the chat overlay on mobile.
  - `aria-live="polite"` around the typing indicator.
  - Real `<label>`s on every icon-only button (most are done; double-check FAB, dropdown trigger).
- **Confirm-before-discard.** Closing the expense dialog with unsaved changes silently drops them. Show a confirm modal when the form is dirty.

### Medium-effort

- **Pagination / virtualization.** The table renders every row. Once a user has 500+ expenses this gets slow. Add cursor pagination on the API + `@tanstack/react-virtual` on the table.
- **Keyboard shortcuts.**
  - `⌘K` global command palette (jump to page, add expense, open chat).
  - `n` → new expense, `/` → focus search, `Esc` → close chat/dialog.
- **Better date picker.** Native `<input type="date">` is ugly on iOS and inconsistent across browsers. Use a popover calendar (e.g. shadcn's `Calendar` + `Popover`).
- **Dashboard density.** A single bar chart isn't pulling its weight. Add:
  - Category donut (top 5 + "Other") for the current month.
  - 7-day trend sparkline above the "This Month" card.
  - Month-over-month delta on each summary card (`+12% vs last month`).
- **Profile form persistence.** Currently hardcoded to "Mahesh KN". Wire to `session` + a `PATCH /api/user` endpoint.
- **PWA basics.** `manifest.json` + a tiny service worker → installable on phones. High value for a daily-use app.

### Bigger UX bets

- **Quick-add bar.** A persistent input at the top of the expenses page: type "300 lunch food" and it parses + saves. Mini version of the AI flow without a round-trip.
- **Bulk actions.** Multi-select rows → bulk delete / bulk recategorize.
- **Inline editing.** Click an amount or category in the table → edit in place. Avoids the dialog for trivial fixes.
- **"This is unusual" badges.** Highlight rows that are >2σ above the user's median for that category. **[AI]** can explain why.

---

## 2. Feature ideas

These also make the AI assistant dramatically more useful — every feature below becomes an MCP tool the model can call.

### Core (build these regardless)

- **Recurring expenses / subscriptions.** Mark an expense as recurring (monthly/weekly/yearly) and auto-create on schedule. Detection: when a similar amount + vendor repeats, suggest it. **[AI]** "What subscriptions am I paying for?"
- **Budgets per category.** Set a monthly limit per category, show progress bars on the dashboard, alert at 80% / 100%. **[AI]** "Am I on track for my food budget?"
- **Income tracking.** Without it you can only show spending, not net cashflow or savings rate.
- **Tags (free-form, multi).** Categories are coarse. Tags like `#work`, `#trip-goa`, `#client-x` enable real slicing.
- **Receipt upload.** Image → vision model extracts vendor / amount / date / line items. Highest-impact feature for a tracker app once you have AI in the loop.
- **CSV / bank-statement import.** The single biggest barrier for tracker apps is data entry. A good importer (with a column-mapping step + dedupe) removes it.
- **Multi-currency with daily FX.** You already have a currency setting; make it real with a free FX API (e.g. exchangerate.host). Each expense stores original + converted amount.
- **Split / shared expenses.** Splitwise-lite if you live with roommates / share trips.
- **Savings goals.** "Save ₹50k by Aug 2026." Show projected vs. actual based on current savings rate.
- **Reports & export.** Monthly PDF summary, CSV export, year-end tax-friendly view.

### AI-native (powered by the MCP server)

- **Natural-language add.** "30 bucks for auto yesterday" → expense saved with category guess.
- **Anomaly detection.** Weekly: "You spent 3× your usual at restaurants this week."
- **Forecasting.** "At your current rate you'll end the month at ₹42,000 — ₹6k over budget."
- **Smart search.** "What did I spend at coffee shops last weekend?" — handled by tool calls, not a search box.
- **Auto-categorization suggestions.** When adding an expense, the model proposes a category from the description.
- **Weekly digest message.** Every Sunday the assistant posts a summary into the chat — turns the chat panel from a Q&A box into a feed.
- **Goal coaching.** "To hit your goal you need to cut ₹2,800/week from Shopping. Top 3 cuts this week: …"

---

## 3. MCP server design notes (for when you build it)

A few principles that make agent-driven UX work well in practice:

- **Narrow, composable tools beat one fat `query` tool.** Models call narrow tools much more reliably:
  - `list_expenses({ from, to, category?, search?, limit?, cursor? })`
  - `summary({ period: "month" | "week" | "year", group_by: "category" | "day" })`
  - `add_expense({ amount, category, description?, date })`
  - `update_expense(id, patch)`
  - `delete_expense(id)`
  - `set_budget(category, amount)`
  - `get_budgets()`
- **Return totals + counts alongside rows.** The model shouldn't have to sum client-side.
- **Include locale + currency metadata in every result.** Lets the model produce already-localized responses without extra tool calls.
- **Expose a `user_context` resource.** Today's date, currency, current month totals, top categories, active budgets. Saves dozens of redundant tool calls per conversation.
- **Idempotency keys on writes.** If the model retries `add_expense` after a flaky network, you don't want a duplicate entry. Accept an optional `idempotency_key` (hash of amount+date+description if not provided).
- **Confirm-before-mutate UX.** For destructive actions (`delete_expense`, bulk operations), have the assistant render a confirmation card in chat — don't auto-execute.
- **Stream thinking + tool calls.** Use streaming so the user sees "Looking at your expenses…" while the call is in flight. Much better than a long opaque pause.
- **Cost control via prompt caching.** Cache the system prompt + recent expense summary in the Anthropic API to keep per-message cost low.

---

## 4. Suggested next steps

If I had to pick three things to do next, in order:

1. **Centralize formatting + persist filters in URL.** Tiny diff, immediate quality bump.
2. **Skeletons + toasts + optimistic updates.** Makes the app feel 2× faster.
3. **Budgets per category + the MCP server's first three tools** (`list_expenses`, `summary`, `add_expense`). Smallest surface that proves the AI loop end-to-end.

Everything else can grow off that base.
