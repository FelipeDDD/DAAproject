# Profile coins and rewards

## Authority and storage

`profiles.currency.coins` is the only balance. New profiles start at zero;
existing profiles with no currency field read as zero and are initialized on
their first grant. Changing class or map does not touch currency.

`convex/rewardStore.js` contains internal helpers, not public grant/spend
mutations. Gameplay authorities authenticate their live player/session or
profile token before calling these helpers. Never accept a client-provided
profile ID, coin amount, correctness flag or arbitrary reward definition as
authorization to grant or spend.

The balance update and `currencyEvents` receipt are committed in the same
Convex mutation transaction. The indexed `(profileId, eventKey)` read makes
duplicate/concurrent events idempotent through Convex transaction retries.
A replay with another amount/source is rejected. Spending requires a positive
safe integer and sufficient balance; no balance may become negative.

## Quizzes

The server determines correctness from the stored question, then calls
`grantQuizReward(ctx, {profileId, attemptKey, correct})`. Configure the amount
once using `QUIZ_CORRECT_REWARD` in `src/economy/config.js`.

- Study and terminal Study: `solo:<server run ID>:<question index>:<player ID>`.
- Multiplayer: `multiplayer:<lobby ID>:<question ID>:<player ID>`. Answer and
  timeout requests additionally identify the displayed lobby/question/index,
  so an old request cannot answer the next question or a replacement lobby.
- IT Challenge, including terminal Challenge: `it-challenge:<run ID>:<question
  index>:<player ID>`. Answers are recorded immediately. Finish reuses the same
  key, so finishing/replaying the result cannot pay twice. Its existing scoring
  and skip behavior are preserved.
- Office3 access questions and Kötting: `puzzle:<server run ID>:<presentation
  index>`. `puzzleQuiz` validates the owner, live session, source room, registered
  static question and actual answer text. Text identifies the chosen answer
  after the existing client-side shuffle. Incorrect answers are also locked,
  preventing a wrong attempt from being resubmitted as correct. New quiz runs
  invalidate the previous run for that profile/source.

These are rewards for new attempts, not once-per-question unlocks. A real new
run/presentation can earn again. Refreshing/reconnecting/replaying the same
attempt cannot. Existing completed attempts are not rewarded retroactively.
The Office3 DEV shortcut only rewards the answer actually submitted; generated
access-proof filler answers do not earn coins. Guests retain their existing
quiz behavior and receive no persistent currency.

For a future Quick Quiz or PvP quiz, authenticate/validate its gameplay event,
derive a stable attempt key from server state, and call the same helper inside
the authoritative mutation. No PvP logic has been connected yet.

## HUD

`CurrencyClient` subscribes to `currency.balance` with the authenticated profile
token. `main.js` starts it on login and stops it on logout/guest entry/HMR.
It is independent of Phaser scenes. The query returns the saved profile balance
and tracks grants/spending from any browser. Old subscription callbacks cannot
overwrite another profile's balance.

`CurrencyHud` renders a small DOM coin/count in the existing bottom HUD. Initial
loading is hidden, subscription errors show a dash, and a balance increase can
animate a small `+N`. Rendering never grants rewards or optimistically changes
the balance. Style and placement are in `src/economy/currency.css`; replace
`hud-currency__coin` to use a future icon asset.

## Extending rewards and roulette

Another coin source calls `grantReward(ctx, {profileId, eventKey, source},
{type: 'coins', amount})` after its own authoritative validation. Use a stable
server event key, never a fresh key on request retry.

New reward types get a handler in `rewardHandlers` in `convex/rewardStore.js`.
That handler should update the appropriate persistent unlock collection with
an idempotent event receipt in the caller's transaction. Existing boss/inventory
rewards have not been migrated. Only `coins` and `none` are implemented here.

`ROULETTE_COST` and `ROULETTE_REWARDS` are in `src/economy/config.js`.
Probability is `weight / totalWeight`: weight 1 out of 100 is 1%; weight 0.01
out of 100 is 0.01%. Weights must be positive/finite and IDs unique.

`convex/rouletteRewards.js` prepares backend-only resolution: it uses server
RNG, spends the configured price, grants the selected prize and saves the
result in one transaction. Reusing the same profile/spin ID returns the saved
result without charging or rolling again. There is deliberately no public
spin endpoint or roulette UI yet. A future endpoint must authenticate ownership
and issue/validate a spin ID before calling this helper; animation only renders
the saved result.

## Focused validation

```powershell
node --test --test-isolation=none tests/economy.test.js tests/quizStatistics.test.js tests/quizPlayerIdentity.test.js tests/quizLobbyView.test.js tests/terminalLeaseRefresh.test.js tests/soloStudy.test.js tests/soloChallenge.test.js tests/terminalChallengeController.test.js tests/office3Safe.test.js tests/office3Puzzle.test.js tests/gameHud.test.js
git diff --check
```

Manual check: log in, answer correct/wrong questions, compare the counter in two
browsers on the same profile, change maps/class, and log out/in again. Try the
Office3 and Kötting flows and verify their streaks/access/gift still behave the
same. Inspect currency placement at your usual viewport sizes and PvP zoom.
