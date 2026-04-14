import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${theme.primary}15`,
    marginTop: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.primary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: theme.backgroundDefault,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.backgroundDefault,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.backgroundTertiary,
    color: theme.textPrimary,
    fontSize: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.backgroundTertiary,
    gap: 4,
  },
  methodButtonActive: {
    backgroundColor: `${theme.primary}15`,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.backgroundTertiary,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
});
