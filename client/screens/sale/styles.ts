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
    customerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      gap: Spacing.md,
    },
    customerLevel: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    cartList: {
      padding: Spacing.lg,
    },
    cartItem: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    cartItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    cartItemDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cartItemInfo: {
      flex: 1,
    },
    cartItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    quantityButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityInput: {
      width: 40,
      textAlign: 'center',
      color: theme.textPrimary,
      fontSize: 16,
    },
    priceInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.sm,
    },
    priceTextInput: {
      width: 60,
      color: theme.textPrimary,
      fontSize: 16,
    },
    emptyCart: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing["4xl"],
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: Spacing.md,
    },
    addProductButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
    },
    totalInfo: {
      flex: 1,
      alignItems: 'flex-end',
    },
    submitButton: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.primary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      height: 44,
    },
    searchInput: {
      flex: 1,
      marginLeft: Spacing.sm,
      color: theme.textPrimary,
      fontSize: 16,
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    customerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    levelBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
  });
};
