# BNB Chain "Smart Money Era" Hackathon Manager

A terminal-style dashboard for tracking hackathon progress, deadlines, and team collaboration.

## 🎯 Hackathon Info

| Field | Details |
|-------|---------|
| **Event** | The Smart Money Era: Build the Era |
| **Dates** | 5 Aug - 9 Sep, 2026 |
| **Prize Pool** | $30,000 USD + adoption |
| **Category** | AI / BNB Agent Studio |
| **Status** | 🚀 Ongoing |

## 🏆 Tracks

### Main Track: BNB Agent Studio Marketplace
**Prize:** $30,000 + official adoption as BNB Agent Studio marketplace

**Required Agents:**
1. Rebalancing (LP ranges, position resets)
2. Grid Trading (automated grid orders)
3. Yield Optimisation (liquidity routing)
4. Health Factor Monitoring (liquidation protection)

### Partner Tracks
- **Altana**: 50,000 Altana XP
- **TermiX**: $6,000 / $3,000 / $1,000
- **PancakeSwap**: 1,000 CAKE

## 🔗 Key Resources

- [BNB Agent Studio](https://www.bnbchain.org/en/bnb-agent-studio)
- [Altana Docs & SDK](https://docs.altana.network/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [TermiX BSC MCP](https://github.com/TermiX-official/bsc-mcp)
- [PancakeSwap Developer Portal](https://developer.pancakeswap.finance/)

## 💻 Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma
- **Observability**: pgbot for PostgreSQL health
- **Frontend**: Terminal-style dashboard (planned)

## 🚀 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/resources` | List hackathon resources |
| `GET /api/deadlines` | Track deadlines |
| `GET /api/tasks` | Task board |
| `GET /api/team` | Team members |
| `GET /api/progress/summary` | Overall progress |
| `GET /api/pgbot/inspect` | Database health |
| `GET /health` | Server health |

## 📦 Project Status

### Completed ✅
- [x] Backend API setup
- [x] PostgreSQL database
- [x] Railway deployment
- [x] Basic CRUD endpoints

### In Progress 🔄
- [ ] Frontend dashboard UI/UX
- [ ] Terminal-style design (term-v0 inspired)
- [ ] Real-time countdown timers
- [ ] Team progress visualization

## 🎨 Design Inspiration

Terminal/command-line aesthetic inspired by term-v0.app:
- Dark theme (#0a0a0f background)
- Monospace fonts (JetBrains Mono)
- Cyan/green accent colors
- ASCII-art inspired borders

## 🔗 Live URLs

- **API**: https://api-production-83367.up.railway.app
- **Dashboard**: Coming soon...

## 📅 Timeline

- **Now - 9 Sep 2026**: Build Phase
- **TBD**: Shortlist Announcement
- **TBD**: Winner Announcement

## 💬 Community

- [Discord](https://discord.com/invite/bnbchain)
- [Twitter](https://twitter.com/BNBChain)
- [Telegram](https://t.me/bnbchain)

## License

MIT
