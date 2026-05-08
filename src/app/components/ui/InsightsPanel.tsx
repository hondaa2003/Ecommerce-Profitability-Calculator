import React from 'react';
import { Insight } from '../../services/ai-insights';
import { useI18n } from '../i18n-provider';

interface InsightsPanelProps {
  insights: Insight[];
  onActionClick?: (action: string, insightId: string) => void;
}

export function InsightsPanel({ insights, onActionClick }: InsightsPanelProps) {
  const { lang, t } = useI18n();

  if (insights.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
        <p className="text-center text-gray-600 dark:text-gray-300">
          {lang === 'ar' ? 'لا توجد توصيات حالياً' : 'No insights available yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
}

interface InsightCardProps {
  insight: Insight;
  onActionClick?: (action: string, insightId: string) => void;
}

function InsightCard({ insight, onActionClick }: InsightCardProps) {
  const { lang } = useI18n();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 dark:bg-green-900 border-l-4 border-green-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500';
      case 'success':
        return 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500';
      case 'info':
        return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return '💡';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      high: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
      medium: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
      low: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    };
    const badge = badges[priority] || badges.low;
    return badge;
  };

  const title = lang === 'ar' ? insight.titleAr : insight.title;
  const description = lang === 'ar' ? insight.descriptionAr : insight.description;
  const actionLabel = lang === 'ar' ? insight.actionLabelAr : insight.actionLabel;
  const priorityBadge = getPriorityBadge(insight.priority);

  return (
    <div className={`p-4 rounded-lg shadow-sm ${getTypeStyles(insight.type)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getTypeIcon(insight.type)}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            {insight.priority && (
              <span className={`text-xs font-bold px-2 py-1 rounded ${priorityBadge.bg} ${priorityBadge.text}`}>
                {insight.priority.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{description}</p>

          {insight.metric && insight.value && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">{insight.metric}:</span>
              <span className="font-bold text-gray-900 dark:text-white">{insight.value}</span>
            </div>
          )}

          {insight.actionable && insight.action && actionLabel && (
            <button
              onClick={() => onActionClick?.(insight.action!, insight.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                hover:bg-gray-100 dark:hover:bg-gray-600
                border border-gray-200 dark:border-gray-600"
            >
              {actionLabel}
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Summary component showing insight statistics
export function InsightsSummary({ insights }: { insights: Insight[] }) {
  const { lang } = useI18n();

  const counts = {
    opportunity: insights.filter((i) => i.type === 'opportunity').length,
    warning: insights.filter((i) => i.type === 'warning').length,
    success: insights.filter((i) => i.type === 'success').length,
    info: insights.filter((i) => i.type === 'info').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {counts.opportunity > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <div className="text-2xl mb-1">💡</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {lang === 'ar' ? 'فرص' : 'Opportunities'}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.opportunity}</div>
        </div>
      )}
      {counts.warning > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {lang === 'ar' ? 'تحذيرات' : 'Warnings'}
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.warning}</div>
        </div>
      )}
      {counts.success > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {lang === 'ar' ? 'نجاحات' : 'Successes'}
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.success}</div>
        </div>
      )}
      {counts.info > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl mb-1">ℹ️</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {lang === 'ar' ? 'معلومات' : 'Info'}
          </div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{counts.info}</div>
        </div>
      )}
    </div>
  );
}
