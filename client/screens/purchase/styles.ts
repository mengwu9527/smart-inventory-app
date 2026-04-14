import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, backgroundColor: theme.primary },
  listContent: { padding: Spacing.lg },
  orderCard: { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing["4xl"] },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.backgroundDefault, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  selectButton: { backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  searchBar: { backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  submitButton: { backgroundColor: theme.primary, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
});
