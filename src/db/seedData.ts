import prisma from './index.js';

export async function seedBnbChainData() {
  console.log('🌱 Cleaning old data and initializing BNB Chain: Smart Money Era Hackathon data...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.teamMember.deleteMany();

  // 1. Create Team Members
  const harry = await prisma.teamMember.create({
    data: {
      name: 'Harry Phan',
      email: 'harry.phan@commandoss.com',
      role: 'Lead Full-Stack & Smart Contract Architect',
    },
  });

  const sarah = await prisma.teamMember.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'AI Agent Systems & 8004scan Specialist',
    },
  });

  const alex = await prisma.teamMember.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'Web3 Frontend & Terminal UI Engineer',
    },
  });

  // 2. Create Real Deadlines for BNB Chain Hackathon
  // Build: Aug 5, 2026 - Sep 9, 2026 (UTC +0) | Shortlist & Judging: Sep 10 - Sep 23, 2026 | Winners: Nov 5, 2026
  const kickoff = await prisma.deadline.create({
    data: {
      title: 'BNB Chain Hackathon Kickoff & Hacker Registration',
      description: 'Official launch of "The Smart Money Era: Build the Era" hackathon on BNB Chain portal. Setup development worktrees and request 8004scan Pro API keys.',
      dueDate: new Date('2026-08-05T00:00:00.000Z'),
      priority: 'MEDIUM',
      status: 'COMPLETED',
      assignedTo: harry.name,
    },
  });

  const midSprint = await prisma.deadline.create({
    data: {
      title: 'Mid-Sprint Milestone: Contracts, SDKs & Agent Benchmarking',
      description: 'Deploy ERC-8004 contracts to BSC Testnet, integrate Altana Session Keys, connect PancakeSwap v3 SDK, and run 3 Agent Advantage benchmarks for TermiX.',
      dueDate: new Date('2026-08-20T23:59:59.000Z'),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: sarah.name,
    },
  });

  const submissionDeadline = await prisma.deadline.create({
    data: {
      title: 'HARD SUBMISSION DEADLINE: Code Freeze, Deck & Video Upload',
      description: 'Official submission closing at 23:59 UTC! Submit Google Form, GitHub repository, live marketplace demo URL, and 3-minute pitch video.',
      dueDate: new Date('2026-09-09T23:59:59.000Z'),
      priority: 'CRITICAL',
      status: 'PENDING',
      assignedTo: alex.name,
    },
  });

  const judgingPeriod = await prisma.deadline.create({
    data: {
      title: 'Shortlist Announcement & Multi-Judge Technical Evaluation',
      description: 'Top 3 shortlisted projects announced publicly. Independent scoring by BNB Chain, TermiX, Altana, and PancakeSwap judges on Functionality, Data Quality & Diversity.',
      dueDate: new Date('2026-09-23T23:59:59.000Z'),
      priority: 'HIGH',
      status: 'PENDING',
      assignedTo: sarah.name,
    },
  });

  const winnersAnnouncement = await prisma.deadline.create({
    data: {
      title: 'Official Winners Announcement & BNB Agent Studio Canonical Adoption',
      description: 'Winners revealed! $30,000 Main Track Champion adopted as the official front door marketplace for BNB Agent Studio on BSC.',
      dueDate: new Date('2026-11-05T12:00:00.000Z'),
      priority: 'MEDIUM',
      status: 'PENDING',
      assignedTo: harry.name,
    },
  });

  // 3. Create Sprint Tasks mapped directly to tracks and submission criteria
  await prisma.task.createMany({
    data: [
      {
        title: 'Implement ERC-8004 Agent Registry Smart Contracts on BSC Testnet',
        description: 'Design and deploy smart contracts on BNB Smart Chain for agent identity, execution permissions, hiring escrow deposits, and 8004 metadata indexing.',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: harry.id,
        deadlineId: kickoff.id,
        completedAt: new Date('2026-08-08T16:00:00.000Z'),
      },
      {
        title: 'Setup High-Performance PostgreSQL + pgbot Observability on Railway',
        description: 'Configure production PostgreSQL database with pgbot telemetry to monitor cache hit ratios, query execution latency, and agent transaction throughput.',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: harry.id,
        deadlineId: kickoff.id,
        completedAt: new Date('2026-08-11T11:30:00.000Z'),
      },
      {
        title: 'Build 4-Category AI Agent Marketplace Hub (Main Track: $30k)',
        description: 'Deliver the core Agent Studio Marketplace with equal depth across all 4 mandatory categories: Rebalancing (LP ranges), Grid Trading (orders), Yield Optimisation (APR), and Health Factor Monitoring (liquidation protection).',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        assigneeId: alex.id,
        deadlineId: midSprint.id,
      },
      {
        title: 'Generate TermiX Required "Agent Advantage Report" (TermiX: $10k)',
        description: 'Execute 3 real benchmarks (Trading Arbitrage, LP Rebalancing, Security Auditing) with vs without an AI agent. Record execution time, gas/cost, and output quality with full proof logs.',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        assigneeId: sarah.id,
        deadlineId: midSprint.id,
      },
      {
        title: 'Integrate Altana Sovereign Session Keys & Keystore Registry (Altana: 50k XP)',
        description: 'Enable self-custodial sovereign agents on Altana wallets with scoped session keys (call allowlist, spend caps, expiry timestamp) and 1-click user revocation inside the terminal UI.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: harry.id,
        deadlineId: midSprint.id,
      },
      {
        title: 'Implement PancakeSwap v3 Smart Swap & LP Router (PancakeSwap: 1,000 CAKE)',
        description: 'Connect PancakeSwap v3 SDK to automatically find optimal token routes, lower slippage, and monitor pool liquidity for active trading agents.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: harry.id,
        deadlineId: midSprint.id,
      },
      {
        title: 'Wire 8004scan Pro API for Real-Time Reputation & Telemetry',
        description: 'Query 8004scan developer API (500 req/min tier) to surface live trust ratings, historical execution metrics, and cross-chain agent ownership data.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigneeId: sarah.id,
        deadlineId: midSprint.id,
      },
      {
        title: 'Record 3-Minute Video Walkthrough & Pitch Demo',
        description: 'Film a high-impact 3:00 demo showing: 1) Marketplace discovery, 2) 1-click agent hiring with Altana session keys, 3) Live BSC trade execution, 4) TermiX benchmark advantage, and 5) pgbot real-time telemetry.',
        status: 'TODO',
        priority: 'CRITICAL',
        assigneeId: alex.id,
        deadlineId: submissionDeadline.id,
      },
      {
        title: 'Finalize Google Form Submission & GitHub Repository Documentation',
        description: 'Complete comprehensive README, architecture diagrams, verified BSC contract addresses, TermiX report attachments, and submit via https://forms.gle/9g9XPNFwnYaHAz9L8.',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: harry.id,
        deadlineId: submissionDeadline.id,
      },
    ],
  });

  // 4. Create Resources for BNB Chain Hackathon
  await prisma.resource.createMany({
    data: [
      {
        title: 'BNB Chain Hackathon: The Smart Money Era Official Portal',
        description: 'Official hackathon details, track specifications, submission guidelines, FAQ, and schedule on the BNB Chain portal.',
        type: 'LINK',
        url: 'https://www.bnbchain.org/en/hackathons/smart-money-era?tab=tracks',
        tags: ['bnbchain', 'hackathon', 'smart-money-era', 'tracks', 'bounties'],
        createdBy: 'Harry Phan',
      },
      {
        title: 'Main Track: $30,000 USD BNB Agent Studio Marketplace',
        description: 'Canonical front door for every agent on BSC. All 4 categories must be surfaced with equal depth: Rebalancing, Grid Trading, Yield Optimisation, and Health Factor Monitoring.',
        type: 'DOCUMENT',
        content: `### Main Track Rubric & Requirements:
- **Prize**: $30,000 USD equivalent + official adoption as the canonical BNB Agent Studio marketplace.
- **Mandatory 4 Categories (Equal Depth)**:
  1. **Rebalancing**: Manages LP ranges, resets positions automatically on DEXes.
  2. **Grid Trading**: Places and dynamically manages automated grid buy/sell orders.
  3. **Yield Optimisation**: Continuously routes liquidity to highest available APR.
  4. **Health Factor Monitoring**: Monitors collateral ratios to protect lending positions against liquidation.
- **Judging Criteria**:
  - **Functionality**: Frictionless end-to-end journey (discover, compare, hire, activate).
  - **Data Quality**: Real-time accurate metrics beyond simple counts.
  - **Agent Diversity**: All 4 categories surfaced with equal depth.`,
        tags: ['main-track', 'marketplace', 'ai-agents', '30k-prize', 'bnb-agent-studio'],
        createdBy: 'Sarah Chen',
      },
      {
        title: 'TermiX Partner Challenge: $10,000 USD + Required Agent Advantage Report',
        description: 'Prize breakdown: 1st $6,000 | 2nd $3,000 | 3rd $1,000. Judged on whether hiring an agent beats doing the job manually, backed by the Agent Advantage Report.',
        type: 'DOCUMENT',
        content: `### TermiX Track Criteria & Report Contract:
- **Evaluation**: Value of services (30%), Proven agent advantage (30%), High-stakes categories & track record (20%), Marketplace quality (20%).
- **Mandatory Agent Advantage Report**:
  - Must benchmark at least 3 real tasks run both ways (Agent vs Manual).
  - For each task, report: execution time, cost/gas, and output quality score (1-100).
  - At least one task must be from trading, stock, or security categories.
- **Resources**: TermiX BSC MCP Server for seamless agent automation.`,
        tags: ['termix', 'bounties', 'agent-advantage-report', '10k-prize', 'mcp'],
        createdBy: 'Sarah Chen',
      },
      {
        title: 'Altana Partner Track: 50,000 Altana XP (Winner Takes All)',
        description: 'Build self-custodial sovereign agents on BNB Chain where agents transact for themselves inside user-scoped limits.',
        type: 'DOCUMENT',
        content: `### Altana Sovereign Agent Requirements:
- **Core Stack**:
  - Agents hold their own Altana wallets with scoped session keys.
  - Limits: call allowlist, spend caps, and expiry timestamp.
  - Session keys registered in public on-chain Keystore registry.
  - Live on-chain transactions visible in the Altana Explorer.
  - 1-click user instant revocation.
- **Bonus Integrations**:
  - Hire agents via ERC-8183 SDK (\`hireErc8183Agent\`).
  - x402 Server SDK (\`@altananetwork/x402-server\`) for streaming micropayments.
  - 10 Production skills at \`skills.altana.network\`: Aave V3, Copy Trade, Four.meme, Lista, PancakeSwap Liquidity/Trading, Token Radar, Venus, Wallet Tracker, x402.`,
        tags: ['altana', 'bounties', 'session-keys', 'sovereign-agents', 'erc-8183', 'x402'],
        createdBy: 'Harry Phan',
      },
      {
        title: 'PancakeSwap Challenge: 1,000 CAKE Bounty',
        description: 'Deliver tangible benefits to PancakeSwap traders and liquidity providers via smarter LP routing, automated arbitrage, and yield optimization.',
        type: 'LINK',
        url: 'https://docs.pancakeswap.finance',
        tags: ['pancakeswap', 'defi', 'dex', 'swap', 'cake'],
        createdBy: 'Harry Phan',
      },
      {
        title: '8004scan Pro-Tier Developer API Access (by AltLayer)',
        description: 'Complimentary Pro-tier API access for hackathon builders: 500 requests/minute, 100,000 requests/day for indexing ERC-8004 metadata and reputation.',
        type: 'LINK',
        url: 'https://8004scan.io',
        tags: ['8004scan', 'api', 'erc-8004', 'reputation', 'altlayer'],
        createdBy: 'Sarah Chen',
      },
      {
        title: 'Official Hackathon Project Submission Form (Google Form)',
        description: 'Official submission form link: submit your GitHub repository, live demo link, and 3-minute pitch video before September 9, 2026 (23:59 UTC).',
        type: 'LINK',
        url: 'https://forms.gle/9g9XPNFwnYaHAz9L8',
        tags: ['submission', 'google-form', 'deadline', 'apply'],
        createdBy: 'Alex Rivera',
      },
      {
        title: 'BSC Testnet Faucet for BNB Gas Tokens',
        description: 'Obtain testnet BNB tokens for deploying smart contracts, funding Altana session keys, and simulating agent transactions.',
        type: 'LINK',
        url: 'https://www.bnbchain.org/en/testnet-faucet',
        tags: ['faucet', 'bsc-testnet', 'gas', 'bnb'],
        createdBy: 'Harry Phan',
      },
      {
        title: 'pgbot - PostgreSQL Real-Time Observability & Profiler',
        description: 'High-performance database profiler and MCP server monitoring cache hit ratio, active query latency, and dead tuple collection on Railway.',
        type: 'LINK',
        url: 'https://github.com/pgrundev/pgbot',
        tags: ['pgbot', 'database', 'postgres', 'observability', 'mcp'],
        createdBy: 'Harry Phan',
      },
    ],
  });

  return {
    success: true,
    message: 'BNB Chain: The Smart Money Era seed completed successfully with all official tracks and bounties.',
  };
}
