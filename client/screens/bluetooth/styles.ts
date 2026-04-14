import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: `${theme.primary}15`,
  },
  statusCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.backgroundTertiary,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statusActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  testButton: {
    backgroundColor: theme.primary,
    flex: 1,
    justifyContent: 'center',
  },
  disconnectButton: {
    backgroundColor: `${theme.error}15`,
    flex: 1,
    justifyContent: 'center',
  },
  emptyStatus: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  deviceList: {
    marginTop: Spacing.md,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.backgroundTertiary,
    marginBottom: Spacing.sm,
  },
  deviceItemActive: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: `${theme.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  bondedTag: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${theme.primary}15`,
    alignSelf: 'flex-start',
  },
  deviceAction: {
    marginLeft: Spacing.md,
  },
  connectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.primary,
  },
  emptyDevices: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  helpList: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
});
