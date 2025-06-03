import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';

export const walletController = {
  /**
   * Получение данных кошелька
   */
  async getWalletData(req: Request, res: Response): Promise<void> {
    try {
      console.log('[WalletController] Получение данных кошелька');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const walletData = await WalletService.getWalletData(req.user.id);
      
      console.log('[WalletController] Данные кошелька получены:', {
        user_id: req.user.id,
        uni_balance: walletData.uni_balance,
        ton_balance: walletData.ton_balance
      });

      res.json({
        success: true,
        data: walletData
      });
    } catch (error) {
      console.error('[WalletController] Ошибка получения данных кошелька:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения данных кошелька'
      });
    }
  },

  /**
   * Получение истории транзакций
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      console.log('[WalletController] Получение истории транзакций');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const transactions = await WalletService.getTransactionHistory(req.user.id, page, limit);
      
      console.log('[WalletController] История транзакций получена:', {
        user_id: req.user.id,
        page,
        limit,
        total: transactions.pagination.total
      });

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('[WalletController] Ошибка получения истории транзакций:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения истории транзакций'
      });
    }
  },

  /**
   * Вывод средств
   */
  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      console.log('[WalletController] Запрос на вывод средств');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const { amount, currency, wallet_address } = req.body;

      if (!amount || !currency || !wallet_address) {
        res.status(400).json({
          success: false,
          error: 'Необходимо указать сумму, валюту и адрес кошелька'
        });
        return;
      }

      const result = await WalletService.processWithdrawal(req.user.id, {
        amount,
        currency,
        wallet_address
      });
      
      console.log('[WalletController] Вывод средств обработан:', {
        user_id: req.user.id,
        amount,
        currency,
        success: result.success
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[WalletController] Ошибка вывода средств:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка вывода средств'
      });
    }
  }
}; 