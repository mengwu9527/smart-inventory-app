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
    categoryScroll: {
      maxHeight: 50,
    },
    categoryContent: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    categoryTag: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.backgroundTertiary,
    },
    categoryTagActive: {
      backgroundColor: theme.primary,
    },
    listContent: {
      padding: Spacing.lg,
      paddingTop: Spacing.md,
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
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    productInfo: {
      flex: 1,
    },
    deleteButton: {
      padding: Spacing.sm,
    },
    productDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    productDetailItem: {
      alignItems: 'center',
    },
    unitsPreview: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    unitTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.backgroundTertiary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing["4xl"],
    },
  });
};
