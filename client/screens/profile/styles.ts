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
    appInfo: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.lg,
    },
    appIcon: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    section: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    menuLabel: {
      flex: 1,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    actionContent: {
      flex: 1,
    },
    copyright: {
      textAlign: 'center',
      marginTop: Spacing.xl,
    },
  });
};
