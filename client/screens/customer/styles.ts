import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing["2xl"],
      paddingBottom: Spacing["5xl"],
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    searchInput: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      height: 44,
    },
    input: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: 16,
      color: theme.textPrimary,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    levelInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      gap: Spacing.md,
      backgroundColor: theme.backgroundDefault,
    },
    levelInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    levelDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    listContent: {
      padding: Spacing.lg,
      paddingTop: Spacing.md,
    },
    customerCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    customerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    customerInfo: {
      flex: 1,
    },
    customerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    levelBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    deleteButton: {
      padding: Spacing.sm,
    },
    customerStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    customerStatItem: {
      alignItems: 'center',
    },
    lastPurchase: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing["4xl"],
    },
  });
};
