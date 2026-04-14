import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundDefault,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    tab: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: theme.primary + '20',
    },
    scrollContent: {
      padding: Spacing.lg,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing["4xl"],
    },
    itemCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    itemFooter: {
      marginTop: Spacing.sm,
      alignItems: 'flex-end',
    },
    paymentButton: {
      marginTop: Spacing.sm,
      alignSelf: 'flex-start',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      width: '80%',
      gap: Spacing.md,
    },
    input: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.sm,
    },
    modalButton: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.primary,
      alignItems: 'center',
    },
  });
};
