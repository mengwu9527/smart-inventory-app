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
    header: {
      marginBottom: Spacing.xl,
    },
    statsCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    statsHeader: {
      marginBottom: Spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    statItem: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    section: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    quickActionItem: {
      width: '22%',
      alignItems: 'center',
    },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    menuList: {
      gap: Spacing.sm,
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
    alertCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      backgroundColor: '#FEF2F2',
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    alertContent: {
      marginBottom: Spacing.md,
    },
    alertButton: {
      alignSelf: 'flex-start',
    },
  });
};
