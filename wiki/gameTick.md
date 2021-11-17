# Game Tick Events

The game runs in ticks, during a tick the following events happen in order:

1. Abandoned stars are captured by allied players.
2. Gifted carriers in orbit of allied stars are transferred.
3. Carriers move and carrier-to-carrier combat is resolved.
4. Carrier-to-star combat is resolved.
5. Carrier drop actions are performed.
6. Ships are built at stars.
7. Carrier collect actions are performed.
8. Carrier garrison actions are performed.
9. Combat occurs at contested stars.
10. If at the end of a galactic cycle:
10a. Players receive credits from economy and banking.
10b. Experimentations are performed.
10c. Carrier upkeep is deducted.
11. Game checks for afk and defeated players.
12. AI actions are performed.
13. Research is performed.
14. Game checks for a winner.
15. Intel is logged.