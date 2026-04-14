import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: theme.backgroundDefault,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: theme.backgroundTertiary,
  },
  filterItemActive: {
    backgroundColor: `${theme.primary}20`,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: theme.backgroundDefault,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  orderItem: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderNoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  orderRemark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  orderFooter: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
});
