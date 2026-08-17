# Requirements: BNB Chain Smart Money Era Hackathon & Marketplace

**Status:** active
**Owner:** @harryphan
**Last updated:** 2026-08-17

## Problem

Developers and traders navigating the BNB Chain AI agent ecosystem lack a unified canonical hub to discover, evaluate, and hire specialized on-chain agents (Rebalancing, Grid Trading, Yield Optimisation, Health Factor Monitoring). Furthermore, hackathon participants struggle with tracking milestone countdowns, bounty deliverables (TermiX Agent Advantage Reports, Altana Session Keys, PancakeSwap routing), and database query performance under high concurrency.

## Why Now

BNB Chain launched "The Smart Money Era: Build the Era" ($30,000 USD Main Track + partner challenges). Building the official marketplace front door allows users to find and activate on-chain agents 24/7 without gatekeepers.

## Success Criteria

| Metric | Target | Measurement Method |
|---|---|---|
| Track Coverage | 100% of 4 mandatory categories (Rebalancing, Grid Trading, Yield, Health Factor) | Category Matrix validation |
| Partner Deliverables | TermiX report, Altana session keys, PancakeSwap SDK, 8004scan API | Submission checklist |
| Database Latency & Health | Buffer cache hit ratio > 99.5%, zero query deadlocks | pgbot telemetry endpoint |
| UI/UX Friction | Friction-free terminal navigation with multi-palette and retro CRT toggle | term-v0 benchmark audit |

## Scope

### In Scope

- Real-time milestone and deadline countdown tracker.
- 3-column Kanban board for sprint tasks with assignee filtering.
- Dedicated Tracks & Bounties explorer with interactive Agent Advantage Report.
- PostgreSQL database observability via pgbot wrapper.
- Integrated global terminal radio streaming with waveform visualizer.

### Out of Scope

- Centralized custody of agent private keys (sovereignty handled via Altana session keys).

## Links

- Design: [docs/design/term-v0-system.md](../design/term-v0-system.md)
- Codebase Navigation: [docs/ai/README.md](../ai/README.md)
