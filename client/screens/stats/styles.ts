import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateRangeBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dateRangeItem: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.backgroundTertiary,
    },
    dateRangeItemActive: {
      backgroundColor: `${theme.primary}20`,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing['5xl'],
    },
    section: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: `${theme.success}15`,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    statCard: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
    },
    trendChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 80,
      marginTop: Spacing.md,
      gap: Spacing.xs,
    },
    trendBar: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    trendBarInner: {
      width: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
      minHeight: 4,
    },
    profitRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: Spacing.md,
    },
    profitItem: {
      alignItems: 'center',
    },
    categoryProfit: {
      marginTop: Spacing.lg,
      gap: Spacing.sm,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    categoryProfitBar: {
      flex: 1,
      height: 8,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    categoryProfitFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    rankingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    rankingBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    rankingBadgeTop: {
      backgroundColor: theme.primary,
    },
    rankingInfo: {
      flex: 1,
    },
    customerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    customerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    levelTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: `${theme.primary}15`,
    },
    inventoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    inventoryItem: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
    },
    inventoryInfo: {
      flex: 1,
    },
    balanceRow: {
      flexDirection: 'row',
      marginTop: Spacing.md,
      gap: Spacing.md,
    },
    balanceItem: {
      flex: 1,
      padding: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
  });
};
