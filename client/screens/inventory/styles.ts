import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
      paddingTop: Spacing["2xl"],
      paddingBottom: Spacing["5xl"],
    },
    filterBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      gap: Spacing.sm,
    },
    filterButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.backgroundTertiary,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    listContent: {
      padding: Spacing.lg,
    },
    productCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    stockBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.backgroundTertiary,
    },
    lowStockBadge: {
      backgroundColor: '#FEF3C7',
    },
    outStockBadge: {
      backgroundColor: '#FEE2E2',
    },
    productDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    productDetailItem: {
      alignItems: 'center',
    },
    unitsInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing["4xl"],
    },
  });
};
