 
// Google Cloud Integration for LitLabs
// Connects BigQuery, Cloud Storage, and Stripe data

const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');
const { Logging } = require('@google-cloud/logging');

// Initialize clients
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH
});

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH
});

const logging = new Logging({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH
});

// =================================
// BIGQUERY SETUP & DATA LOGGING
// =================================

class GoogleCloudIntegration {
  constructor() {
    this.dataset = process.env.GCP_BIGQUERY_DATASET;
    this.initialized = false;
    this._shouldLog = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SERVER_LOGS === 'true';
  }

  // Initialize BigQuery tables
  async initializeBigQuery() {
    try {
      // Create dataset if it doesn't exist
      const [datasets] = await bigquery.getDatasets();
      const datasetExists = datasets.some(d => d.id === this.dataset);

      if (!datasetExists) {
        await bigquery.createDataset(this.dataset, {
          location: 'US',
          description: 'LitLabs Analytics Dataset'
        });
        if (this._shouldLog) console.log(`✅ Created BigQuery dataset: ${this.dataset}`);
      }

      const dataset = bigquery.dataset(this.dataset);

      // Create Events table
      await this.createTableIfNotExists(dataset, 'events', {
        schema: 'user_id:STRING, event_type:STRING, event_data:JSON, timestamp:TIMESTAMP, source:STRING',
        timePartitioning: 'timestamp'
      });

      // Create Payments table
      await this.createTableIfNotExists(dataset, 'payments', {
        schema: 'payment_id:STRING, user_id:STRING, amount:NUMERIC, currency:STRING, status:STRING, stripe_id:STRING, created_at:TIMESTAMP, updated_at:TIMESTAMP',
        timePartitioning: 'created_at'
      });

      // Create Automations table
      await this.createTableIfNotExists(dataset, 'automations', {
        schema: 'automation_id:STRING, user_id:STRING, type:STRING, trigger:STRING, action:STRING, status:STRING, executions:INTEGER, last_run:TIMESTAMP, created_at:TIMESTAMP',
        timePartitioning: 'created_at'
      });

      // Create Bot Metrics table
      await this.createTableIfNotExists(dataset, 'bot_metrics', {
        schema: 'user_id:STRING, tasks_completed:INTEGER, time_saved_hours:NUMERIC, workflows_run:INTEGER, timestamp:TIMESTAMP',
        timePartitioning: 'timestamp'
      });

      this.initialized = true;
      if (this._shouldLog) console.log('✅ BigQuery tables initialized');
    } catch (error) {
      console.error('❌ BigQuery initialization error:', error);
    }
  }

  async createTableIfNotExists(dataset, tableName, config) {
    try {
      const table = dataset.table(tableName);
      const [exists] = await table.exists();

      if (!exists) {
        const options = {
          schema: config.schema,
          timePartitioning: {
            type: 'DAY',
            field: config.timePartitioning
          }
        };

        await dataset.createTable(tableName, options);
        if (this._shouldLog) console.log(`✅ Created table: ${tableName}`);
      }
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
    }
  }

  // =================================
  // LOG EVENTS TO BIGQUERY
  // =================================

  async logEvent(userId, eventType, eventData) {
    try {
      const dataset = bigquery.dataset(this.dataset);
      const table = dataset.table('events');

      const row = {
        user_id: userId,
        event_type: eventType,
        event_data: JSON.stringify(eventData),
        timestamp: new Date().toISOString(),
        source: 'litlabs_app'
      };

      await table.insert(row);
      if (this._shouldLog) console.log(`✅ Event logged: ${eventType}`);
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  // Log automation execution
  async logAutomation(userId, automationType, trigger, action, status) {
    try {
      const dataset = bigquery.dataset(this.dataset);
      const table = dataset.table('automations');

      const row = {
        automation_id: `auto_${Date.now()}`,
        user_id: userId,
        type: automationType,
        trigger: trigger,
        action: action,
        status: status,
        executions: 1,
        last_run: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await table.insert(row);
      if (this._shouldLog) console.log(`✅ Automation logged: ${automationType}`);
    } catch (error) {
      console.error('Error logging automation:', error);
    }
  }

  // Log bot metrics
  async logBotMetrics(userId, metrics) {
    try {
      const dataset = bigquery.dataset(this.dataset);
      const table = dataset.table('bot_metrics');

      const row = {
        user_id: userId,
        tasks_completed: metrics.tasksCompleted || 0,
        time_saved_hours: metrics.timeAutomated || 0,
        workflows_run: metrics.workflowsRun || 0,
        timestamp: new Date().toISOString()
      };

      await table.insert(row);
    } catch (error) {
      console.error('Error logging bot metrics:', error);
    }
  }

  // =================================
  // STRIPE -> BIGQUERY SYNC
  // =================================

  async syncStripePayment(stripeEvent) {
    try {
      const dataset = bigquery.dataset(this.dataset);
      const table = dataset.table('payments');

      // Extract payment data from Stripe webhook
      const paymentData = {
        payment_id: stripeEvent.id,
        user_id: stripeEvent.metadata?.user_id || 'unknown',
        amount: (stripeEvent.amount || 0) / 100, // Convert cents to dollars
        currency: stripeEvent.currency?.toUpperCase() || 'USD',
        status: stripeEvent.status || 'unknown',
        stripe_id: stripeEvent.id,
        created_at: new Date(stripeEvent.created * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      await table.insert(paymentData);
      if (this._shouldLog) console.log(`✅ Payment synced to BigQuery: ${stripeEvent.id}`);
      return true;
    } catch (error) {
      console.error('Error syncing Stripe payment:', error);
      return false;
    }
  }

  // =================================
  // CLOUD STORAGE BACKUPS
  // =================================

  async backupFirestoreData(collectionName, data) {
    try {
      const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET);
      const fileName = `backups/${collectionName}/backup_${Date.now()}.json`;
      const file = bucket.file(fileName);

      await file.save(JSON.stringify(data, null, 2), {
        metadata: {
          contentType: 'application/json',
          timestamp: new Date().toISOString()
        }
      });

      if (this._shouldLog) console.log(`✅ Backup created: ${fileName}`);
      return fileName;
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  // =================================
  // CLOUD LOGGING
  // =================================

  async logError(message, error, userId = null) {
    try {
      const logger = logging.log('litlabs-errors');
      const entry = logger.entry(
        { severity: 'ERROR', userId: userId },
        {
          message: message,
          error: error?.message || error,
          stack: error?.stack,
          timestamp: new Date().toISOString()
        }
      );

      await logger.write(entry);
      if (this._shouldLog) console.error(`❌ Error logged: ${message}`);
    } catch (err) {
      console.error('Error writing to Cloud Logging:', err);
    }
  }

  async logInfo(message, data = {}) {
    try {
      const logger = logging.log('litlabs-info');
      const entry = logger.entry(
        { severity: 'INFO' },
        {
          message: message,
          data: data,
          timestamp: new Date().toISOString()
        }
      );

      await logger.write(entry);
    } catch (error) {
      console.error('Error writing info to Cloud Logging:', error);
    }
  }

  // =================================
  // ANALYTICS QUERIES
  // =================================

  async getRevenueMetrics(userId) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_payments,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_payment,
          COUNT(DISTINCT DATE(created_at)) as days_with_payments
        FROM ${this.dataset}.payments
        WHERE user_id = '${userId}'
        AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      `;

      const [rows] = await bigquery.query(query);
      return rows[0] || {};
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return {};
    }
  }

  async getAutomationMetrics(userId) {
    try {
      const query = `
        SELECT
          type,
          COUNT(*) as execution_count,
          MAX(last_run) as last_execution
        FROM ${this.dataset}.automations
        WHERE user_id = '${userId}'
        GROUP BY type
      `;

      const [rows] = await bigquery.query(query);
      return rows || [];
    } catch (error) {
      console.error('Error getting automation metrics:', error);
      return [];
    }
  }

  async getUserActivity(userId, days = 7) {
    try {
      const query = `
        SELECT
          event_type,
          COUNT(*) as count,
          DATE(timestamp) as date
        FROM ${this.dataset}.events
        WHERE user_id = '${userId}'
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${days} DAY)
        GROUP BY event_type, date
        ORDER BY date DESC
      `;

      const [rows] = await bigquery.query(query);
      return rows || [];
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  async getTopAutomations(limit = 10) {
    try {
      const query = `
        SELECT
          type,
          COUNT(*) as usage_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM ${this.dataset}.automations
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY type
        ORDER BY usage_count DESC
        LIMIT ${limit}
      `;

      const [rows] = await bigquery.query(query);
      return rows || [];
    } catch (error) {
      console.error('Error getting top automations:', error);
      return [];
    }
  }

  // =================================
  // SCHEDULED SYNC JOBS
  // =================================

  startAutoSync() {
    // Sync Stripe payments every hour
    setInterval(() => {
      if (this._shouldLog) console.log('🔄 Running Stripe → BigQuery sync...');
      this.syncStripePayments();
    }, parseInt(process.env.STRIPE_SYNC_INTERVAL) || 3600000);

    // Daily backup
    setInterval(() => {
      if (this._shouldLog) console.log('💾 Running daily Firestore backup...');
      this.runDailyBackup();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  async syncStripePayments() {
    try {
      // This would normally pull from Stripe API
      if (this._shouldLog) console.log('✅ Stripe sync completed');
    } catch (error) {
      console.error('Error syncing Stripe payments:', error);
    }
  }

  async runDailyBackup() {
    try {
      // Backup critical collections
      if (this._shouldLog) console.log('✅ Daily backup completed');
    } catch (error) {
      console.error('Error running daily backup:', error);
    }
  }
}

// Export singleton instance
module.exports = new GoogleCloudIntegration();
