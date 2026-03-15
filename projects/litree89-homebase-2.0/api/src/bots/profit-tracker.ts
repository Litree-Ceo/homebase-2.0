/**
 * @workspace Bot Profit Tracker - ROI Analytics & Performance Monitoring
 *
 * Tracks trading signals, executed trades, and profit metrics
 * Provides real-time ROI calculation and strategy comparison
 */

export interface TradeExecution {
  id: string;
  signalId: string;
  botId: string;
  coin: string;
  entryPrice: number;
  entryTime: string;
  quantity: number;
  totalCost: number;
  exitPrice?: number;
  exitTime?: string;
  status: 'open' | 'closed' | 'cancelled';
  profitLoss?: number;
  profitLossPercent?: number;
  fees: number;
  strategy: string;
}

export interface BotPerformance {
  botId: string;
  strategy: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // %
  totalProfit: number; // USD
  totalLoss: number; // USD
  netProfit: number; // USD
  roi: number; // %
  avgWin: number; // USD
  avgLoss: number; // USD
  profitFactor: number; // Avg Win / Avg Loss
  maxDrawdown: number; // %
  sharpeRatio: number; // Risk-adjusted returns
  bestTrade: number; // Max profit
  worstTrade: number; // Max loss
  lastTradeTime: string;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  trades: number;
  profit: number;
  roi: number;
}

export interface PortfolioSnapshot {
  timestamp: string;
  totalBalance: number; // USD
  investedCapital: number;
  openPositions: OpenPosition[];
  closedTrades: TradeExecution[];
  totalProfit: number;
  totalROI: number;
  topPerformer: string; // Strategy name
}

export interface OpenPosition {
  coin: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedProfit: number;
  unrealizedProfitPercent: number;
  timeInTrade: string; // "2h 30m"
}

export class ProfitTracker {
  private readonly trades: Map<string, TradeExecution> = new Map();
  private readonly botPerformance: Map<string, BotPerformance> = new Map();
  private portfolioHistory: PortfolioSnapshot[] = [];

  /**
   * Record a new trade execution
   */
  recordTrade(trade: Omit<TradeExecution, 'id'>): TradeExecution {
    const id = `trade_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const fullTrade: TradeExecution = { ...trade, id };
    this.trades.set(id, fullTrade);
    return fullTrade;
  }

  /**
   * Close a trade and calculate P&L
   */
  closeTrade(tradeId: string, exitPrice: number, fees: number = 0): TradeExecution | null {
    const trade = this.trades.get(tradeId);
    if (!trade || trade.status === 'closed') {
      return null;
    }

    const profitLoss = trade.quantity * (exitPrice - trade.entryPrice) - fees;
    const profitLossPercent = (profitLoss / trade.totalCost) * 100;

    const closedTrade: TradeExecution = {
      ...trade,
      exitPrice,
      exitTime: new Date().toISOString(),
      status: 'closed',
      profitLoss,
      profitLossPercent,
      fees,
    };

    this.trades.set(tradeId, closedTrade);
    this.updateBotPerformance(closedTrade);

    return closedTrade;
  }

  /**
   * Get performance metrics for a bot
   */
  getBotPerformance(botId: string): BotPerformance | undefined {
    return this.botPerformance.get(botId);
  }

  /**
   * Get all bot performance rankings
   */
  getAllPerformance(): BotPerformance[] {
    return Array.from(this.botPerformance.values()).sort((a, b) => b.roi - a.roi); // Highest ROI first
  }

  /**
   * Get portfolio snapshot
   */
  getPortfolioSnapshot(currentPrices: Map<string, number>): PortfolioSnapshot {
    const openPositions: OpenPosition[] = [];
    let totalProfit = 0;
    let investedCapital = 0;

    // Calculate open positions
    for (const trade of this.trades.values()) {
      if (trade.status === 'open') {
        const currentPrice = currentPrices.get(trade.coin) || trade.entryPrice;
        const unrealizedProfit = trade.quantity * (currentPrice - trade.entryPrice) - trade.fees;
        const unrealizedProfitPercent = (unrealizedProfit / trade.totalCost) * 100;

        openPositions.push({
          coin: trade.coin,
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          currentPrice,
          unrealizedProfit,
          unrealizedProfitPercent,
          timeInTrade: this.getTimeInTrade(trade.entryTime),
        });

        investedCapital += trade.totalCost;
      }
    }

    // Calculate realized profit from closed trades
    for (const trade of this.trades.values()) {
      if (trade.status === 'closed' && trade.profitLoss) {
        totalProfit += trade.profitLoss;
      }
    }

    // Add unrealized profit
    const unrealizedProfit = openPositions.reduce((sum, pos) => sum + pos.unrealizedProfit, 0);
    const totalBalance = investedCapital + totalProfit + unrealizedProfit;
    const totalROI = ((totalProfit + unrealizedProfit) / investedCapital) * 100;

    // Find top performer
    const topPerformer = this.getAllPerformance()[0]?.strategy || 'None';

    const snapshot: PortfolioSnapshot = {
      timestamp: new Date().toISOString(),
      totalBalance,
      investedCapital,
      openPositions,
      closedTrades: Array.from(this.trades.values()).filter(t => t.status === 'closed'),
      totalProfit,
      totalROI,
      topPerformer,
    };

    this.portfolioHistory.push(snapshot);
    return snapshot;
  }

  /**
   * Update performance metrics for a bot
   */
  private updateBotPerformance(trade: TradeExecution): void {
    let perf = this.botPerformance.get(trade.botId);

    perf ??= {
      botId: trade.botId,
      strategy: trade.strategy,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      roi: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      bestTrade: 0,
      worstTrade: 0,
      lastTradeTime: '',
      monthlyStats: [],
    };

    perf.totalTrades++;
    perf.lastTradeTime = trade.exitTime || new Date().toISOString();

    if (trade.profitLoss && trade.profitLoss > 0) {
      perf.winningTrades++;
      perf.totalProfit += trade.profitLoss;
      perf.bestTrade = Math.max(perf.bestTrade, trade.profitLoss);
    } else if (trade.profitLoss && trade.profitLoss < 0) {
      perf.losingTrades++;
      perf.totalLoss += Math.abs(trade.profitLoss);
      perf.worstTrade = Math.min(perf.worstTrade, trade.profitLoss);
    }

    perf.netProfit = perf.totalProfit - perf.totalLoss;
    perf.winRate = perf.totalTrades > 0 ? (perf.winningTrades / perf.totalTrades) * 100 : 0;
    perf.avgWin = perf.winningTrades > 0 ? perf.totalProfit / perf.winningTrades : 0;
    perf.avgLoss = perf.losingTrades > 0 ? perf.totalLoss / perf.losingTrades : 0;
    perf.profitFactor = perf.avgLoss > 0 ? perf.avgWin / perf.avgLoss : 0;

    // Rough ROI calculation (per $100 invested)
    perf.roi = (perf.netProfit / (perf.totalTrades * 100)) * 100 || 0;

    this.botPerformance.set(trade.botId, perf);
  }

  /**
   * Format time difference
   */
  private getTimeInTrade(entryTime: string): string {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  /**
   * Get strategy comparison report
   */
  getStrategyComparison(): StrategyComparison[] {
    return this.getAllPerformance().map(perf => ({
      strategy: perf.strategy,
      roi: perf.roi,
      winRate: perf.winRate,
      totalTrades: perf.totalTrades,
      netProfit: perf.netProfit,
      sharpeRatio: perf.sharpeRatio,
      profitFactor: perf.profitFactor,
    }));
  }

  /**
   * Reset tracker (for testing)
   */
  reset(): void {
    this.trades.clear();
    this.botPerformance.clear();
    this.portfolioHistory = [];
  }
}

export interface StrategyComparison {
  strategy: string;
  roi: number;
  winRate: number;
  totalTrades: number;
  netProfit: number;
  sharpeRatio: number;
  profitFactor: number;
}
